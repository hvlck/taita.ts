/**
 * Taita options configuration
 * @param case Case sensitivity - if set to `true`, command matching will respect case; if set to `false`, matching will not care about case
 * @param exact Exact matching - `true` matches commands exactly, while `false` uses the String.prototype.includes() method to match
 * @param ranking If set to `true`, commands will be ranked according to the amount of time they're used
 * @param sort The type of sort to use on matched commands
 */
export interface TaitaOptions {
    case: boolean;
    exact: boolean;
    ranking: boolean;
    sort: SortType;
}

/**
 * Ranking interface
 */
export interface Rankings {
    /**
     * get a command's rank
     * @param commands
     */
    get(...commands: string[]): boolean | number[];
    /**
     * Resets the ranks of all commands to 0
     */
    clear(): void;
    /**
     * resets the rank of specified commands to 0
     * @param commands an array of strings of the commands you wish to reset the rank of - these strings will match a command's aliases or name
     */
    reset(...commands: string[]): boolean;
}

/**
 * Represents a single command
 * @param name the name of the command (this should be displayed in your UI)
 * @param callback the function to call when the command is invoked
 * @param rank the initial rank of the command. Note that this can be ommitted, and will default to 0.
 * @param aliases any aliases of the command (these serve the same function as the name property)
 */
export interface Command {
    name: string;
    callback: Function;
    rank: number;
    aliases?: string[];
}

/**
 * Method to sort commands by
 * @param Alphabetical sort commands alphabetically
 * @param RevAlphabetical sort commands reverse-alphabetically
 * @param Rank sort commands by their internal rank
 * @param RevRank sort commands by lowest rank
 */
export enum SortType {
    Alphabetical = 'alphabetical',
    RevAlphabetical = 'reverse-alphabetical',
    Rank = 'rank',
    RevRank = 'reverse-rank',
}

/**
 *
 */
export interface TaitaInstance {
    commands: Command[];
    matched: {
        old: string[];
        commands: string[];
        changed: Function;
        reset: Function;
        sort: Function;
        ranks: Command[];
    };
    rankings: Rankings;
    options: TaitaOptions;
    update(): false | Command[];
    remove(): boolean;
}

/**
 * The main method of using Taita
 */
export default class Taita implements TaitaInstance {
    /**
     * @param commands The list of all Command objects registered as commands by the Taita instance
     */
    commands: Command[];
    /**
     * @param matched.old list of old matched commands (note that the items in the array correspond to Command.name properties)
     * @param matched.commands list of currently matched commands, as calculated by the last call on Instance.listen()
     * @param matched.changed determines whether or not the matched commands have changed since the last time Instance.listen() was called
     * @param matched.reset reset all matched commands
     * @param matched.sort sort all matched commands by a SortType
     */
    matched: {
        old: string[];
        commands: string[];
        changed: Function;
        reset: Function;
        sort: Function;
        ranks: Command[];
    };
    /**
     * @param rankings utilities for working with command rankings
     */
    rankings: Rankings;
    /**
     * @param options the configuration options for the Taita instanec
     */
    options: TaitaOptions;

    /**
     * Creates a new Taita instance.
     * @param source The list of commands to use. For instance:
     * ```javascript
     * [
     *  {
     *     name: "This is an example command",
     *     callback: function() {
     *        console.log('console.log')
     *     },
     *     rank: 5,
     *     aliases: ['This is an alias for an example command']
     *  }
     * ]
     * ```
     * The object in the array is a co
     * @param options - taita configuration options. These can be overwritten by setting the instance.options property directly
     */
    constructor(source: Command[], options?: TaitaOptions) {
        this.commands = source;
        if (options) {
            this.options = options;
        } else {
            this.options = {
                ranking: false,
                case: false,
                sort: SortType.Alphabetical,
                exact: false,
            };
        }

        this.matched = {
            ranks: [],
            old: this.commands.map((i) => i.name),
            commands: [],

            changed: function () {
                if (this.old != this.commands) {
                    return true;
                } else {
                    return false;
                }
            },

            reset: function () {
                this.old = this.commands;
                this.commands = [];

                return this.commands;
            },

            sort: (type: SortType) => {
                if (type == 'alphabetical') {
                    this.matched.commands.sort((a, b) => {
                        if (a.localeCompare(b) > b.localeCompare(a)) {
                            return 1;
                        } else if (a.localeCompare(b) < b.localeCompare(a)) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                } else if (type == 'reverse-alphabetical') {
                    this.matched.commands.sort((a, b) => {
                        if (a.localeCompare(b) > b.localeCompare(a)) {
                            return -1;
                        } else if (a.localeCompare(b) < b.localeCompare(a)) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                } else if (type == 'rank' || type == 'reverse-rank') {
                    this.matched.commands.forEach((item, index) => {
                        this.matched.ranks[index].name = item;
                    }); // Populates ranks with names of currently matched commands

                    Object.values(this.commands).forEach((item) => {
                        Object.values(this.matched.ranks).forEach((arrItem, index) => {
                            if (item.name == arrItem.name) {
                                this.matched.ranks[index].rank = item.rank || 0;
                            }
                            if (item.aliases) {
                                item.aliases.forEach((alias: string) => {
                                    if (alias == arrItem.name) {
                                        this.matched.ranks[index].rank = item.rank || 0;
                                    }
                                });
                            }
                        });
                    }); // Populates matched commands with ranks

                    if (type == 'rank') {
                        this.matched.ranks.sort((a, b) => b.rank - a.rank); // Sorts objects by rank
                    } else if (type == 'reverse-rank') {
                        this.matched.ranks.sort((a, b) => a.rank - b.rank); // Sorts objects by rank
                    }

                    this.matched.commands = this.matched.ranks.map((item) => item.name);
                } else {
                    throw new Error('Invalid sorting pattern');
                }
            },
        };

        this.rankings = {
            get: (...commands: string[]) => {
                if (commands.length == 0) {
                    return false;
                } else {
                    return commands
                        .map((command) => {
                            const cmd = this.contains(command);
                            if (cmd) {
                                return cmd.rank;
                            } else {
                                return false;
                            }
                        })
                        .map((i) => (typeof i == 'number' ? i : 0));
                }
            },

            reset: (...commands: string[]) => {
                if (commands.length == 0) {
                    return false;
                } else {
                    let t = commands.map((command) => {
                        const cmd = this.contains(command);
                        if (cmd) {
                            const idx = this.commands.indexOf(cmd);
                            this.commands[idx].rank = 0;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    return t.every((i) => i == true) ? true : false;
                }
            },

            clear: () => {
                this.commands.forEach((i) => (i.rank = 0));
            },
        };
    }

    /**
     * Updates the given commands
     * @param args An array of Command objects to update
     */
    update(...args: Command[]) {
        if (args.length == 0) {
            return false;
        } else {
            return args.map((arg) => {
                const cmd = this.contains(arg.name);
                if (cmd) {
                    this.commands[this.commands.indexOf(cmd)] = arg;
                }

                return arg;
            });
        }
    }

    /**
     * Removes specified commands.
     * @param args The commands to remove. Note that the parameter is a string array since the strings will be matched against every command's aliases and names.
     */
    remove(...args: string[]) {
        if (args.length == 0) {
            return false;
        } else {
            let t = args.map((arg) => {
                const cmd = this.contains(arg);
                if (!cmd) return false;

                this.commands.splice(this.commands.indexOf(cmd));
                return true;
            });

            return t.every((i) => i == true) ? true : false;
        }
    }

    /**
     * Replaces **every** registered command. If you only want to replace a select few commands, use the instance.update() method
     * @param source The updated list of commands to use
     */
    replace(source: Command[]) {
        if (!source) {
            return false;
        } else {
            this.commands = source;
            return this.commands;
        }
    }

    /**
     * Returns commands that match the value argument. The return value is an array of all the Command.names of any matching commands.
     * Sort settings are taken from the instance's options property, so make sure you set it before you call it if you want to sort commands differently.
     * @param value - the text of the command to try to match (this can be part of an alias or the name of the command)
     */
    listen(value: string) {
        // Listens for user input to return matching commands
        this.matched.reset(); // Resets matched

        if (this.options.case === false) {
            value = value.toLowerCase();
        }
        this.commands.forEach((command) => {
            if (command.aliases) {
                command.aliases.forEach((_alias, index) => {
                    if (!command.aliases || command.aliases?.length > 0 == false) return;
                    // Matching based on various options
                    if (this.options.case === false) {
                        if (this.options.exact === true) {
                            if (command.aliases[index].toLowerCase().startsWith(value)) {
                                this.matched.commands.push(command.aliases[index]);
                            }
                        } else {
                            if (command.aliases[index].toLowerCase().includes(value)) {
                                this.matched.commands.push(command.aliases[index]);
                            }
                        }
                    } else {
                        if (this.options.exact === true) {
                            if (command.aliases[index].startsWith(value)) {
                                this.matched.commands.push(command.aliases[index]);
                            }
                        } else {
                            if (command.aliases[index].includes(value)) {
                                this.matched.commands.push(command.aliases[index]);
                            }
                        }
                    }
                });
            }

            if (this.options.case === false) {
                if (this.options.exact === true) {
                    if (command.name.toLowerCase().startsWith(value)) {
                        this.matched.commands.push(command.name);
                    }
                } else {
                    if (command.name.toLowerCase().includes(value)) {
                        this.matched.commands.push(command.name);
                    }
                }
            } else {
                if (this.options.exact === true) {
                    if (command.name.startsWith(value)) {
                        this.matched.commands.push(command.name);
                    }
                } else {
                    if (command.name.includes(value)) {
                        this.matched.commands.push(command.name);
                    }
                }
            }
        });

        if (this.options.sort) {
            this.matched.sort(this.options.sort);
        }

        return this.matched.commands;
    }

    /**
     * Execute the specified command
     * @param command - any identifier of a Command (alias, or name) that is to be executed
     */
    execute(command: string) {
        // Executes given command from one of its values (e.g. description, name, function name, etc.)
        const cmd = this.contains(command);
        if (typeof cmd != 'object') {
            return false;
        }

        if (!cmd || !cmd.callback) {
            return false;
        }
        if (this.options.ranking) {
            // Updates command's rank
            if (!cmd.rank) {
                cmd.rank = 1;
            } else if (cmd.rank >= 1) {
                cmd.rank += 1;
            }
        }

        return cmd.callback.apply(cmd);
    }

    /**
     * Determines whether or not a specified string is contained within a command (if the name or any alias matches the given string).
     * This is mostly used internally by Taita, but also provided for convenience.
     * @param item The string to search
     */
    contains(item: string): undefined | Command {
        if (!item) {
            return;
        }

        return this.commands.find((command) => {
            if (command.name == item) {
                return command;
            } else if (command.aliases?.length != 0) {
                if (command.aliases?.indexOf(item) != -1) {
                    return command;
                } else return false;
            } else {
                return false;
            }
        });
    }
}
