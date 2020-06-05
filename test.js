let commandpal = new CommandPal('/commands.json');

let inp = document.querySelector('input');

window.addEventListener('load', () => {
    inp.value = ''
});

let changed;

inp.addEventListener('input', () => {
    commandpal.listen(inp.value);
    changed = commandpal.matchedCommands.changed();
    if (changed && document.querySelector('#commands')) {
        document.querySelector('#commands').remove(); 
    };

    updateCommands();
});

commandpal.updateCommands('/alt.json');

inp.addEventListener('keypress', event => {
    if (event.keyCode == 13 && document.querySelector('#commands')) {
        commandpal.execute(document.querySelector('#commands').firstChild.innerText);
    } else if (event.keyCode == 40) {
        
    }
});

function updateCommands() {
    let newDiv;
    changed ? newDiv = document.createElement('div') : newDiv = document.querySelector('#commands');
    newDiv.id = 'commands';
    newDiv.classList.add('fadeIn', 'commands')
    commandpal.matchedCommands.commands.forEach(item => {
        if (item) {
            item = [item];
            item.forEach(command => {
                let newCommand = document.createElement('p');
                newCommand.innerText = command;
                newDiv.appendChild(newCommand);
            });

            document.body.appendChild(newDiv);
        }
    });
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