let commandpal = new CommandPal('/commands.json', { sort: 'alphabetical' });

let inp = document.querySelector('input');
let commands;

let commandIndex = 0;

window.addEventListener('load', () => {
    inp.value = '';
});

let changed = commandpal.matchedCommands.changed();

inp.addEventListener('focus', () => {
    commandpal.listen(inp.value);
    updateCommands();
})

inp.addEventListener('input', () => {
    commandpal.listen(inp.value);

    updateCommands();
});

inp.addEventListener('keydown', event => {
    if (event.keyCode == 13 && commands) {
        Object.values(commands.children).forEach(child => {
            if (child.classList.contains('focused')) {
                commandpal.execute(child.innerText)
            }
        });
        inp.value = '';
        commandpal.listen('');
        updateCommands();
    } else if (event.keyCode == 38) { // Up arrow key
        Object.values(commands.children).forEach(child => child.classList.remove('focused'));
        if (commandIndex <= 0) {
            commands.children[commands.children.length - 1].classList.add('focused')
            commandIndex = commands.children.length - 1;
        } else {
            commandIndex -= 1;
            commands.children[commandIndex].classList.add('focused');
        }
    } else if (event.keyCode == 40) { // Down arrow key
        Object.values(commands.children).forEach(child => child.classList.remove('focused'));
        if (commandIndex >= commands.children.length - 1) {
            commands.children[0].classList.add('focused')
            commandIndex = 0;
        } else {
            commandIndex += 1;
            commands.children[commandIndex].classList.add('focused');
        }
    }
});

function updateCommands() {
    commandIndex = 0;
    if (changed && document.querySelector('#commands')) {
        commands = document.querySelector('#commands');
        Object.values(commands.children).forEach(child => child.remove());
    }
    else {
        commands = buildElement('div', '', {
            id: 'commands',
            className: 'fadeIn commands'
        })
    }

    commandpal.matchedCommands.commands.forEach(item => {
        if (item) {
            item = [item];
            item.forEach(command => {
                let newCommand = buildElement('p', command)
                commands.appendChild(newCommand);

                newCommand.addEventListener('mouseover', () => {
                    Object.values(commands.children).forEach(child => child.classList.remove('focused'));
                    newCommand.classList.add('focused');
                });

                newCommand.addEventListener('click', () => {
                    commandpal.execute(newCommand.innerText);    
                    commandpal.listen(inp.value);
                    updateCommands();                
                });
            });

            document.body.appendChild(commands);
        }
    });

    if (commands.children) {
        commands.children[commandIndex].classList.add('focused');
    }
}

const buildElement = (type, text, attributes) => {
    let element = document.createElement(type);
    element.innerText = text;
    if (attributes) {
        Object.keys(attributes).forEach(item => {
            if (item.includes('data_')) { element.dataset[item.slice(4)] = attributes[item] }
            else { element[item] = attributes[item] }
        });
    }
    return element;
}

// Command Palette functions

function light() {
    document.querySelector('link').href = 'https://cdn.jsdelivr.net/npm/gyr-css@1.6.3/dist/light-variable.css';
};

function dark() {
    document.querySelector('link').href = 'https://cdn.jsdelivr.net/npm/gyr-css@1.6.3/dist/dark-variable.css';
};

function add() {
    commandpal.insertCommand(
        {
            'remove': {
                'name': 'Remove this command',
                'callback': 'remove'
            }
        }
    );
}

function remove() {
    commandpal.removeCommand('remove');
}

function addCase() {
    commandpal.options.update({
        case: true
    });

    commandpal.insertCommand({
        'removeCase': {
            'name': 'Remove case sensitivty',
            'callback': 'removeCase'
        }
    })
};

function removeCase() {
    commandpal.options.update({
        case: false
    });
    commandpal.removeCommand('removeCase');
}