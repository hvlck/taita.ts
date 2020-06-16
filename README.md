# commandpal

Command palette library

## File Structure

```markdown
Commandpal
/src/
    /commandpal.js - core file

Demo
/index.html - demo page
/commands.json - list of all commands, their names, aliases, and callbacks
/script.js - command palette ui, location of callback functions

Meta
/README.md
/LICENSE
```

## Roadmap

### Options

+ ~~Case sensitivity~~
+ ~~Exact and Partial matching~~
+ ~~Sort commands~~
+ ~~Dev mode~~ [always a work-in-progress]
  + ~~Helpful errors~~

### Methods

+ ~~Sort commands~~
+ ~~Execute command~~

### Other

+ Hidden alias matching (if command string matches alias, show the normal command)
+ ~~Reverse-history sorting~~
+ ~~Reverse-alphabetical sorting~~
+ Command options
+ **Docs**
  + ~~Code commenting~~ [always a work-in-progress]
+ ~~Support for JS objects as commands~~
