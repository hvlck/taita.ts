/**
 * A command palette instance
 * @constructor
 */
class Taita {
    /**
     * The Taita class constructor initialises a new Taita instance, configured with commands and options
     * @param {(string|object)} source - if a string, a link to a JSON file that is automatically fetched; if an object, a list of CommandItems
     * @param {object} options - taita configuration options
     */
    constructor(source, options) {
        this.source = source; // JSON file with commands

        this.matchedCommands = {
            _oldCommands: this.commands,
            commands: [],

            changed: function () {
                if (this._oldCommands != this.commands) {
                    return true;
                } else {
                    return false;
                }
            },

            reset: function () {
                this._oldCommands = this.commands;
                this.commands = [];
                return this.commands;
            },

            sort: (type) => {
                if (type == 'alphabetical') {
                    this.matchedCommands.commands.sort((a, b) => {
                        if (a.localeCompare(b) > b.localeCompare(a)) {
                            return 1;
                        } else if (a.localeCompare(b) < b.localeCompare(a)) {
                            return -1;
                        }
                    });
                } else if (type == 'reverse-alphabetical') {
                    this.matchedCommands.commands.sort((a, b) => {
                        if (a.localeCompare(b) > b.localeCompare(a)) {
                            return -1;
                        } else if (a.localeCompare(b) < b.localeCompare(a)) {
                            return 1;
                        }
                    });
                } else if (type == 'rank' || type == 'reverse-rank') {
                    this.matchedCommands.ranks = [];
                    this.matchedCommands.commands.forEach((item, index) => {
                        this.matchedCommands.ranks[index] = {};
                        this.matchedCommands.ranks[index].name = item;
                    }); // Populates ranks with names of currently matched commands

                    Object.values(this.commands).forEach((item) => {
                        Object.values(this.matchedCommands.ranks).forEach((arrItem, index) => {
                            if (item.name == arrItem.name) {
                                this.matchedCommands.ranks[index].rank = item.rank || 0;
                            }
                            if (item.aliases) {
                                item.aliases.forEach((alias) => {
                                    if (alias == arrItem.name) {
                                        this.matchedCommands.ranks[index].rank = item.rank || 0;
                                    }
                                });
                            }
                        });
                    }); // Populates matched commands with ranks

                    if (type == 'rank') {
                        this.matchedCommands.ranks.sort((a, b) => parseFloat(b.rank) - parseFloat(a.rank)); // Sorts objects by rank
                    } else if (type == 'reverse-rank') {
                        this.matchedCommands.ranks.sort((a, b) => parseFloat(a.rank) - parseFloat(b.rank)); // Sorts objects by rank
                    }

                    this.matchedCommands.commands = this.matchedCommands.ranks.map((item) => item.name);
                } else {
                    throw new Error('Invalid sorting pattern');
                }
            },
        };

        this.rankings = {
            getRankings: (...commands) => {
                if (commands.length == 0) {
                    throw new Error('', 'No commands specified when calling rankings.getRanking().');
                } else {
                    return commands.map((command) => {
                        return this.commands[this._commandContains(command)].rank || 0;
                    });
                }
            },

            resetRankings: (...commands) => {
                if (commands.length == 0) {
                    throw new Error('', 'No command specified when calling rankings.resetRanking().');
                } else {
                    return commands.map((command) => {
                        this.commands[this._commandContains(command)].rank = 0;
                        return this.commands[this._commandContains(command)];
                    });
                }
            },

            reset: () => {
                Object.keys(this.commands).forEach((item) => (this.commands[item].rank = 0));
            },
        };

        this.commands = {}; // Raw commands from command source

        const defaults = {
            case: false,
            dev: false,
            exact: false,
            ranking: false,
            sort: false,
        };

        this.options = {
            // Developer-set options
            items: Object.assign(
                {
                    case: false,
                    dev: false,
                    exact: false,
                    ranking: false,
                    sort: false,
                },
                options
            ), // Default settings as fallback, also assigned to fill in settings gap

            reset: function (...items) {
                // Removes options key/value
                if (items.length === 0) {
                    throw new Error('', 'No item specified when calling options.remove().');
                } else {
                    return items.map((item) => {
                        this.items[item] = defaults[item];
                        return this.items[item];
                    });
                } // Return array of rest items with new change
            },

            update: function (items) {
                if (!items) {
                    throw new Error('', 'No item(s) specified when calling options.update().');
                } else {
                    this.items = Object.assign(this.items, items);
                    return this.items;
                }
            },
        };

        this._fetchCommands();
    }

    /**
     * Update or create new commands
     * @param  {...any} args - each arg is a new Command; existing items are replaced, while new commands are added if there isn't a command with that name already
     */
    updateCommand(...args) {
        // Updates specified command
        if (args.length === 0) {
            throw new Error('', 'No specified command when calling method updateCommand().');
        }
        args.forEach((arg) => {
            this.commands[Object.keys(arg)[0]] = Object.assign(
                Object.values(arg)[0],
                this.commands[Object.keys(arg)[0]]
            );
        });
    }

    /**
     * Remove commands
     * @param  {...string} args - a list of command names, aliases, or callbacks; the command each belongs to will be removed from the registry
     */
    removeCommands(...args) {
        // Removes specified commands
        if (args.length === 0) {
            throw new Error('', `No specified command when calling method removeCommand().`);
        } else {
            args.forEach((arg) => {
                delete this.commands[this._commandContains(arg)];
                return this.commands[this._commandContains(arg)];
            });
        }
    }

    _fetchCommands() {
        // Assigns/Fetches list of commands
        if (typeof this.source == 'string' && this.source.endsWith('.json')) {
            fetch(this.source)
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    // Fetches commands from JSON file and inputs them into various variables
                    this.commands = data;
                })
                .catch((err) => {
                    throw new Error(err, `Failed to load commands from source ${this.source}.`);
                });
        } else if (typeof this.source == 'object') {
            this.commands = this.source;
        } else {
            throw new Error('', 'Invalid source type provided.');
        }
    }

    /**
     * Update the entire list of commands at once, in the same method as they are set using the constructor
     * @param {(string|object)} source - if a string, a link to the JSON file that contains the commands to be used; if an object, an object of Commands to be used
     */
    updateCommandList(source) {
        // Updates list of commands
        if (!source) {
            throw new Error('', 'No source provided when calling Taita.updateCommandList()');
        } else {
            this.source = source;
            this._fetchCommands();
        }
    }

    _commandContains(item) {
        if (!item) {
            throw new Error('', 'No item specified when calling Taita._commandContains()');
            return;
        }
        let key = false;
        if (this.commands[item]) {
            key = item;
        } else {
            Object.keys(this.commands).forEach((command) => {
                if (this.commands[command].name == item) {
                    key = command;
                } else if (this.commands[command].callback == item) {
                    key = command;
                } else if (this.commands[command].aliases) {
                    this.commands[command].aliases.forEach((alias) => {
                        if (alias == item) {
                            key = command;
                        }
                    });
                } else {
                    return false;
                }
            });
        }
        return key;
    }

    /**
     * Returns commands that match the value argument
     * @param {string} value - the text of the command to try to match
     */
    listen(value) {
        // Listens for user input to return matching commands
        this.matchedCommands.reset(); // Resets matchedCommands

        if (this.options.items.case === false) {
            value = value.toLowerCase();
        }
        Object.keys(this.commands).forEach((command) => {
            if (this.commands[command].aliases) {
                this.commands[command].aliases.forEach((alias, index) => {
                    // Matching based on various options
                    if (this.options.items.case === false) {
                        if (this.options.items.exact === true) {
                            if (this.commands[command].aliases[index].toLowerCase().startsWith(value)) {
                                this.matchedCommands.commands.push(this.commands[command].aliases[index]);
                            }
                        } else {
                            if (this.commands[command].aliases[index].toLowerCase().includes(value)) {
                                this.matchedCommands.commands.push(this.commands[command].aliases[index]);
                            }
                        }
                    } else {
                        if (this.options.items.exact === true) {
                            if (this.commands[command].aliases[index].startsWith(value)) {
                                this.matchedCommands.commands.push(this.commands[command].aliases[index]);
                            }
                        } else {
                            if (this.commands[command].aliases[index].includes(value)) {
                                this.matchedCommands.commands.push(this.commands[command].aliases[index]);
                            }
                        }
                    }
                });
            }

            if (this.options.items.case === false) {
                if (this.options.items.exact === true) {
                    if (this.commands[command].name.toLowerCase().startsWith(value)) {
                        this.matchedCommands.commands.push(this.commands[command].name);
                    }
                } else {
                    if (this.commands[command].name.toLowerCase().includes(value)) {
                        this.matchedCommands.commands.push(this.commands[command].name);
                    }
                }
            } else {
                if (this.options.items.exact === true) {
                    if (this.commands[command].name.startsWith(value)) {
                        this.matchedCommands.commands.push(this.commands[command].name);
                    }
                } else {
                    if (this.commands[command].name.includes(value)) {
                        this.matchedCommands.commands.push(this.commands[command].name);
                    }
                }
            }
        });

        if (this.options.items.sort) {
            this.matchedCommands.sort(this.options.items.sort);
        }

        return this.matchedCommands.commands;
    }

    /**
     * Execute the specified command
     * @param {*} command - any identifier of a Command (alias, callback, or name) that is to be executed
     * @param {*} [obj=window] - the object to execute the command against
     */
    execute(command, obj) {
        // Executes given command from one of its values (e.g. description, name, function name, etc.)
        let commandItems = this.commands[this._commandContains(command)];
        if (!commandItems || !commandItems.callback) {
            throw new Error('', `Failed to execute command ${command}.  No callback or command was found.`);
        }
        let callback = commandItems.callback;
        if (this.options.items.ranking) {
            // Updates command's rank
            if (!commandItems.rank) {
                commandItems.rank = 1;
            } else if (commandItems.rank >= 1) {
                commandItems.rank += 1;
            }
        }
        if (!obj) {
            obj = window;
        }
        obj[callback](command);
    }
}
