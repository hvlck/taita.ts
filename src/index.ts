interface TaitaOptions {
    case: boolean;
    exact: boolean;
    ranking: boolean;
    sort: SortType;
}

interface Rankings {
    get(...commands: string[]): boolean | number[];
    clear(): void;
    reset(...commands: string[]): boolean;
}

interface Command {
    name: string;
    callback: string | Function;
    rank: number;
    aliases?: string[];
}

enum SortType {
    Alphabetical = 'alphabetical',
    RevAlphabetical = 'reverse-alphabetical',
    Rank = 'rank',
    RevRank = 'reverse-rank',
}

interface TaitaInstance {
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

export default class Taita implements TaitaInstance {
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
                this.commands = [];
            },
        };
    }

    update(...args: Command[]) {
        // Updates specified command
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

    remove(...args: string[]) {
        // Removes specified commands
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

    replace(source: Command[]) {
        if (!source) {
            return false;
        } else {
            this.commands = source;
            return this.commands;
        }
    }

    /**
     * Returns commands that match the value argument
     * @param {string} value - the text of the command to try to match
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
     * @param {*} command - any identifier of a Command (alias, callback, or name) that is to be executed
     * @param {*} [obj=window] - the object to execute the command against
     */
    execute(command: string, fn: Function) {
        // Executes given command from one of its values (e.g. description, name, function name, etc.)
        const cmd = this.contains(command);
        if (typeof cmd != 'object') {
            return false;
        }

        if (!cmd || !cmd.callback) {
            return false;
        }
        let callback = cmd.callback;
        if (this.options.ranking) {
            // Updates command's rank
            if (!cmd.rank) {
                cmd.rank = 1;
            } else if (cmd.rank >= 1) {
                cmd.rank += 1;
            }
        }

        return fn.call(callback);
    }

    contains(item: string): undefined | Command {
        if (!item) {
            return;
        }

        return this.commands.find((command) => {
            if (command.name == item || command.callback == item) {
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
