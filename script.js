let commandpal = new CommandPal('/commands.json', { sort: 'alphabetical' });

let inp = document.querySelector('input');
let commands;

window.addEventListener('load', () => {
    inp.value = ''
});

let changed;

inp.addEventListener('input', () => {
    commandpal.listen(inp.value);
    changed = commandpal.matchedCommands.changed();
    if (changed && commands) {
        Object.values(commands.children).forEach(child => child.remove());
    };

    updateCommands();
});

inp.addEventListener('keypress', event => {
    if (event.keyCode == 13 && commands) {
        if (commands.firstChild) { commandpal.execute(commands.firstChild.innerText) };
        Object.values(commands.children).forEach(child => child.remove());
        inp.value = '';
        commandpal.listen('');
        updateCommands();
    }
});

function updateCommands() {
    changed ? commands = document.createElement('div') : commands = document.querySelector('#commands');
    commands.id = 'commands';
    commands.classList.add('fadeIn', 'commands')

    commandpal.matchedCommands.commands.forEach(item => {
        if (item) {
            item = [item];
            item.forEach(command => {
                let newCommand = buildElement('p', command)
                commands.appendChild(newCommand);
            });

            document.body.appendChild(commands);
        }
    });
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
    document.body.style.background = '#fafafa';
    document.body.style.color = '#676767';
};

function dark() {
    document.body.style.background = '#676767';
    document.body.style.color = '#fafafa';
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