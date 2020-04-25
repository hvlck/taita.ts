# commandpal

Easily create command palettes for your web apps

## File Structure

### CommandPal

/src/

### Demo

/route/

/index.html

/commands.json

/test.js

### Meta

/README.md

/LICENSE

## Roadmap

### Options

+ Case sensitivity
+ RegEx matching
+ Exact and Partial matching
+ Match all when no command string (e.g. show all commands if no value is in the input)
+ Sort commands
+ Dev mode

### Methods

+ Disable/Remove
+ Sort commands
+ Execute command by matching the text with the function

### Other

+ Flags
+ Variables in command strings (e.g. "Change background color to *x*")
+ NLP (very doubtful)
+ History (optional) to remember used commands and typos
+ Conflicting commands in different routes
+ Stop rebuilding every time input changes (to stop repeated animations and save memory)
+ Debugging support
+ **Docs**
+ Sort out all the command variables (and add one that only contains commands in the current scope)
+ Find a more efficient way to loop through everything (looking at you `Object.keys()`)
+ Better demo
