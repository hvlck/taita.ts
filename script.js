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

let commandpal = new CommandPal('/commands.json', {
    sort: 'alphabetical',
    ranking: true
});

let inp = buildElement('input', '', {
    type: 'text',
    placeholder: 'Enter command...',
    value: ''
});

document.body.appendChild(inp);

let commands;

let commandIndex = 0;

let changed = commandpal.matchedCommands.changed();

inp.addEventListener('focus', () => {
    updateCommands();
});

inp.addEventListener('input', () => {
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
        updateCommands();
    } else if (event.keyCode == 38) { // Up arrow key
        if (!commands.children) { return }
        Object.values(commands.children).forEach(child => child.classList.remove('focused'));
        if (commandIndex <= 0) {
            commands.children[commands.children.length - 1].classList.add('focused')
            commandIndex = commands.children.length - 1;
        } else {
            commandIndex -= 1;
            commands.children[commandIndex].classList.add('focused');
        }
    } else if (event.keyCode == 40) { // Down arrow key
        if (!commands.children) { return }
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
    commandpal.listen(inp.value);
    commandIndex = 0;
    if (changed && document.querySelector('#commands')) {
        commands = document.querySelector('#commands');
        Object.values(commands.children).forEach(child => child.remove());
    }
    else {
        commands = buildElement('div', '', {
            id: 'commands',
            className: 'fadeIn commands'
        });
    };

    commandpal.matchedCommands.commands.forEach(item => {
        let newCommand = buildElement('p', item);

        newCommand.addEventListener('click', () => {
            commandpal.execute(newCommand.innerText);
        });

        newCommand.addEventListener('mouseover', () => {
            Object.values(commands.children).forEach(child => child.classList.remove('focused'));
            newCommand.classList.add('focused');
        });

        commands.appendChild(newCommand);
    });

    document.body.appendChild(commands);

    if (commands.children.length != 0) {
        commands.children[commandIndex].classList.add('focused');
    }
}

// Command Palette functions

function light() {
    document.querySelector('link').href = 'https://cdn.jsdelivr.net/npm/gyr-css@1.6.3/dist/light-variable.css';
};

function dark() {
    document.querySelector('link').href = 'https://cdn.jsdelivr.net/npm/gyr-css@1.6.3/dist/dark-variable.css';
};

function add() {
    commandpal.updateCommand({
        remove: {
            name: "Remove this command",
            callback: "remove",
            aliases: [
                "Second alias to remove this command"
            ]
        }
    });
}

function remove() {
    commandpal.removeCommands('remove');
}

function addCase() {
    commandpal.options.update({
        case: true
    });

    commandpal.updateCommand({
        removeCase: {
            name: "Remove case sensitivty",
            callback: "removeCase"
        }
    });
};

function removeCase() {
    commandpal.options.update({
        case: false
    });
    commandpal.removeCommands('removeCase');
}

function toggleSort() {
    if (commandpal.options.items.sort == 'alphabetical') {
        commandpal.options.update({
            sort: 'reverse-alphabetical'
        });
    } else if (commandpal.options.items.sort == 'reverse-alphabetical') {
        commandpal.options.update({
            sort: 'rank'
        });
    } else if (commandpal.options.items.sort == 'rank') {
        commandpal.options.update({
            sort: 'reverse-rank'
        });
    } else if (commandpal.options.items.sort == 'reverse-rank') {
        commandpal.options.update({
            sort: 'alphabetical'
        });
    };

    updateCommands();
}

function refreshCommands() {
    commandpal.updateCommandList('./commands.json');
    updateCommands();
}