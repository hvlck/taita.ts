# commandpal

Command palette library

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

+ ~~Case sensitivity~~
+ RegEx matching
+ Exact and ~~Partial~~ matching
+ ~~Sort commands~~
+ Dev mode [in-prog]

### Methods

+ Reset
+ Sort commands [in-prog {~~alphabetical~~, ~~reverse-alphabetical~~}]
+ ~~Execute command~~

### Other

+ Hidden alias matching (if command string matches alias, show the normal command)
+ History (optional extension) to remember used commands and typos
+ Reverse-history sorting
+ ~~Reverse-alphabetical sorting~~
+ Command options
  + Weight (higher weight = higher ranking; weight * history)
+ **Docs**
+ ~~Support for JS objects as commands~~
+ Demo: fix error navigating with arrow keys when there are no matching commands
