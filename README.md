# commandpal

Easily create command palettes for your web apps

## File Structure

```markdown
Commandpal
/src/
    /commandpal.js

Demo
/index.html
/commands.json
/test.js

Meta
/README.md
/LICENSE
```

## Roadmap

### Options

+ Case sensitivity
+ RegEx matching
+ Exact and Partial matching
+ Match all when no command string (e.g. show all commands if no value is in the input)
+ Sort commands
+ Dev mode

### Methods

+ Reset
+ Sort commands
+ ~~Execute command by matching the text with the function~~

### Other

+ Flags
+ Variables in command strings (e.g. "Change background color to *x*")
+ History (optional extension) to remember used commands and typos
+ Stop rebuilding every time input changes (to stop repeated animations and save memory)
+ **Docs**
+ Sort out all the command variables (and add one that only contains commands in the current scope)
+ Better demo
+ Support for JS objects as commands
+ Updating specific commands, rather than replacing the entire thing
