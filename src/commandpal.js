class CommandPal {
    constructor(file, options) {
        this.file = file; // JSON file with commands

        this.matchedCommands = {
            _oldCommands: this.commands,
            commands: [],
            callbacks: [],

            changed: function () {
                if (this._oldCommands != this.commands) { return true }
                else { return false }
            },

            reset: function () {
                this._oldCommands = this.commands;
                this.commands = [];
                this.callbacks = [];
            }
        };

        this.commands = {};

        this.options = { // Developer-set options
            items: options || {
                case: false // Default settings as fallback
            }, // Options object

            removeItem: function (item) { // Removes options key/value
                delete this.items[item];
            },

            addItems: function (item) {
                this.items = Object.assign(this.items, item);
            }
        }

        this.getCommands();
    }

    insertCommand(...args) {
        args.forEach(arg => this.commands[Object.keys(arg)[0]] = Object.values(arg)[0]);
    }

    removeCommand(...args) {
        args.forEach(arg => {
            if (this.commands[arg]) {
                delete this.commands[arg];
            } else {
                Object.keys(this.commands).forEach(command => {
                    if (this.commands[command].name == arg) {
                        delete this.commands[command];
                    }
                })
            }
        })
    }

    getCommands() {
        fetch(this.file).then(res => { return res.json() }).then(data => { // Fetches commands from JSON file and inputs them into various variables
            this.commands = Object.assign(this.commands, data);
        }).catch(err => { this._generateError(err) });
    }

    updateCommands(file) {
        if (file == this.file) { return false }
        else {
            this.file = file;
            this.getCommands();
        }
    }

    listen(value) { // Listens for user input to return matching commands
        this.matchedCommands.reset();

        if (this.options.items.case === false) { value = value.toLowerCase() }
        Object.keys(this.commands).forEach(command => {
            if (this.commands[command].aliases) {
                this.commands[command].aliases.forEach((alias, index) => {
                    if (this.options.items.case === false) {
                        if (this.commands[command].aliases[index].toLowerCase().includes(value)) {
                            this.matchedCommands.commands.push(this.commands[command].aliases[index]);
                        }
                    } else {
                        if (this.commands[command].aliases[index].includes(value)) {
                            this.matchedCommands.commands.push(this.commands[command].aliases[index]);
                        }
                    }
                });
            }

            if (this.commands[command].name.toLowerCase().includes(value)) {
                this.matchedCommands.commands.push(this.commands[command].name);
                this.matchedCommands.callbacks.push(this.commands[command].callback)
            }
        });
    };

    execute(command) { // Executes given command from one of its values (e.g. description, name, function name, etc.)
        let callback;
        if (typeof command == 'function') {
            command();
        } else {
            Object.values(this.commands).forEach(item => {
                if (item.name == command) {
                    callback = item.callback;
                } else {
                    if (item.aliases) {
                        item.aliases.forEach(alias => {
                            if (alias == command) {
                                callback = item.callback;
                            }
                        });                        
                    }
                }
            });
            window[callback]();
        }
    };

    _generateError(error) { // Developer mode erorr reporting
        console.error(`CommandPal failure: ${error}`);
    };
}
