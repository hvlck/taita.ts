let e = new CommandPal('/commands.json');

window.addEventListener('load', () => {
    document.querySelector('input').value = ''
});

let changed;

document.querySelector('input').addEventListener('input', () => {
    e.listen(document.querySelector('input').value);
    changed = e.matchedCommands.changed();
    if (changed && document.querySelector('#commands')) {
        document.querySelector('#commands').remove(); 
    };

    updateCommands();
});

function updateCommands() {
    let newDiv;
    changed ? newDiv = document.createElement('div') : newDiv = document.querySelector('#commands');
    newDiv.id = 'commands';
    newDiv.classList.add('fadeIn', 'commands')
    e.matchedCommands.commands.forEach(item => {
        if (item) {
            item = [item];
            item.forEach(command => {
                let newCommand = document.createElement('p');
                newCommand.addEventListener('click', e.execute(newCommand));
                newCommand.innerText = command;
                newDiv.appendChild(newCommand);
            });

            document.body.appendChild(newDiv);
        }
    });
}

function changeBackgroundColor() {
    document.body.style.background = 'red';
};
