class CommandPal {
    constructor(file, options) {
        this.file = file;
        this.routes = [];
        this.rawCommands;
        
        this.matchedCommands = {
            _oldCommands: this.commands,
            commands: [],

            changed: function() {
                if (this._oldCommands != this.commands) { return true }
                else { return false }
            },

            reset: function() {
                this._oldCommands = this.commands;
                this.commands = [];
            }
        };

        this.options = {
            items: options,

            removeItem: function(item) {
                delete this.items[item];
            }
        }

        this.status = {
            value: false,
            
            getStatus: function() {
                return this.value;
            },

            _updateStatus: function(value) {
                this.value = value;
            }
        }

        fetch(file).then(res => { return res.json() }).then(data => {
            this.rawCommands = data;
            Object.keys(data).forEach(item => { this.routes.push(item) });

            this.commands = {};
            this.routes.forEach(item => {
                if (window.location.pathname == item || item == 'global') {
                    this.commands[item] = {};
                    this.commands[item].commands = [];
                    this.commands[item].commands.push(Object.values(this.rawCommands[item])[0])
                } else { return };
            });
        }).catch(err => { this._generateError(err) });
    }

    listen(value) {
        this.matchedCommands.reset();

        value = value.toLowerCase();
        Object.keys(this.commands).forEach(route => {
            Object.keys(this.commands[route].commands).forEach(command => {
                this.commands[route].commands[command].aliases.forEach((alias, index) => {
                    if (this.commands[route].commands[command].aliases[index].toLowerCase().includes(value)) {
                        this.matchedCommands.commands.push(this.commands[route].commands[command].aliases[index]);
                    }
                });

                if (this.commands[route].commands[command].name.toLowerCase().includes(value)) {
                    this.matchedCommands.commands.push(this.commands[route].commands[command].name);
                }
            });
        });
    };

    execute(command) {
        
    };

    _generateError(error) {
        console.error(`CommandPal failure: ${err}`);
    }
}
