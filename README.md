# taita

command palette library

[Demo](https://ethanjustice.github.io/taita/)
 | [NPM](https://www.npmjs.com/package/taita)

## Table of Contents

+ [File Structure](#file-structure)
+ [Roadmap](#roadmap)
+ [Usage](#usage)

## File Structure

```markdown
Taita
/src/
    /taita.js - core file
    /index.js - source version for use with NPM
/dist/
    /taita.js - production version of the core file
    /index.js - production version for use with NPM

Demo
/index.html - demo page
/commands.json - list of all commands, their names, aliases, and callbacks
/script.js - command palette ui, location of callback functions

Meta
/README.md
/LICENSE
```

## Roadmap

+ Remove console error logging, use `return` statements instead

## Usage

In your `package.json`:

```json
"dependencies": {
  "taita": "~1.3.0"
  ...
}
```

Make sure to update the version, then run `npm install taita`.

And finally, import it:

```javascript
const { Taita } = require("taita");

let commandPalette = new Taita({
  // ...
});
```

### Setup

```javascript
let commandpal = new Taita({
    "commandname": {
      name: "This is an example command",
      callback: "callback",
      aliases: [
        "Example alias one",
        "2nd example alias"
      ]
    }
},
{
    dev: true
});
```

### Constructor(*source*, *options*)

[](#constructor)

| Parameter | Type | Use | Examples |
| --------- | ---- | --- | -------- |
| *source* | string or object | Location of JSON used for commands, in either a string (link to file) or an object | `'./commands.json'` (for an example of an object source, see the [Setup](#setup) section)
| *options* | object | options used | see [*options* Values](#options-values) below |

#### *options* Values

[](#options-values)

| Name | Type | Use | Values | Example |
| ---- | ---- | --- | ------ | ------- |
| case | boolean | Determines whether returned commands from the `listen()` method match case | `true`: exact case is matched.  `false` (default): case is not matched | `case: false` |
| dev | boolean | Logs useful errors | `true`: dev mode on.  `false` (default): dev mode off | `dev: true` |
| exact | boolean | Determines whether commands are matched exactly | `true`: commands are matched exactly.  `false` (default): commands aren't matched exactly | `exact: true` |
| ranking | boolean | creates a ranking system that ranks the amount of times a command is used | `true`: commands are ranked.  `false` (default): commands aren't ranked | `ranking: true` |
| sort | string | default sorting value | `alphabetical` (default): sorts commands alphabetically.  `reverse-alphabetical`: sorts commands in reverse-alphabetical order.  `rank` (`ranking` key must be `true`): sorts commands by most used.  `reverse-rank` (`ranking` key must be `true`): sorts commands by least used | `sort: 'reverse-rank'` |

Any values not specified are automatically filled by the default value.

Defaults:

```javascript
{
    case: false,
    dev: false,
    exact: false,
    ranking: false,
    sort: false
}
```

Custom:

```javascript
{
    case: true,
    sort: 'reverse-alphabetical',
    exact: true
}
```

### Registering Commands

[](#registering-commands)

### Methods

#### execute(*command*, *object*)

Executes a command (this can be an alias, callback, or the name of a command) against an `object` (this defaults to the `window` object).  Passes the name of the `command` parameter as an argument to the function called.

```javascript
instance.execute(document.querySelector('.active-command').innerText);
```

#### listen(*value*)

Matches commands to specified input `value`.  Returns an `array` of matched commands.

```javascript
let commands = instance.listen(document.querySelector('input[type="text"]').value);
```

#### removeCommands(...*commands*)

Accepts `strings` with the name of a command (note: this refers to the parent's name, not the `name` field).

```javascript
instance.removeCommands("commandname");
```

#### updateCommand(...*commands*)

Accepts `objects` with the same syntax as when registering commands (see [Registering Commands](#registering-commands)).

```javascript
instance.updateCommand({
    "commandname": {
      "name": "Example command",
      "callback": "callback",
      "aliases": ["This is an alias"]
    }
});
```

#### updateCommandList(*source*)

Updates the source of commands.  Accepts an `object` or a `string`.  See [Constructor documentation (*source* parameter)](#constructor).  Note: if the new source is equal to the old source, `false` is returned and execution is stopped.

Updating the list with a different JSON file:
```javascript
instance.updateCommandList('path-to-new-json.json');
```

Updating the list with an `object`:

```javascript
instance.updateCommandList({
  "commandname": {
      "name": "Example command",
      "callback": "callback",
      "aliases": ["This is an alias"]
  },
  "commandnameTwo": {
      "name": "Example command two",
      "callback": "callbackTwo",
      "aliases": ["This is an alias to the second command"]
  }
})
```

### Properties

#### *commands*

`object`
Contains the raw commands imported from the source, in addition to any ranks if the `ranking` key is specified in the options.

```javascript
instance.commands
```

#### *matchedCommands*

`object`

```javascript
instance.matchedCommands
```

##### Properties

###### commands

An array of all the currently matched commands, as last specified by calling `instance.listen()`.

```javascript
instance.matchedCommands.commands;
```

##### Methods

###### changed()

Checks to see whether the matched commands have changed.  Returns `true` if they have, and `false` if they haven't.

```javascript
instance.matchedCommands.changed();
```

###### reset()

Resets all currently matched commands.  Returns the new value of `instance.matchedCommands.commands`, which should be an empty `array`.

```javascript
instance.matchedCommands.reset(); // []
```

###### sort(*type*)

Sorts `instance.matchedCommands.commands` by the specified `type` parameter.  `type` can be any `string` as specified in the [Constructor Options (*sort*) documentation](#options-values).

```javascript
instance.matchedCommands.sort('alphabetical');
```

#### *options*

`object`
Contains the options, as well as several methods.  To access options items directly, use `instance.options.items[key]`.

##### Methods

###### reset(...*items*)

Resets the values of all specified items to the default.  Returns the new values of the specified items in an `array`.

```javascript
instance.options.reset('case', 'dev') // returns [false, false]
```

##### update(*items*)

Accepts an `object`.  Updates the specified keys in the `options` property with their specified value.  Returns the new value of `options.items`.

```javascript
instance.options.update({ case: true, dev: false });
```

#### *rankings*

`object`

```javascript
instance.rankings
```

##### Methods

###### getRankings(...*command*)

Accepts `strings` containing any value of a command object (an alias, name, callback, command name).

Returns an `array` filled with `numbers` that equate to the rank of the specified command.  Defaults to `0`.

```javascript
instance.rankings.getRankings('commandname');
```

##### reset()

Resets the ranks of all commands to `0`.

```javascript
instance.rankings.reset();
```

##### resetRankings(...*command*)

Accepts `strings` containing the any value of a command object (name, an alias, callbakc, command name).

Resets the rank of the specified commands.  Returns an `array` filled with the new values of each command (`name`, `aliases`, `callback`, and `rank`).

```javascript
instance.rankings.resetRankings('commandname');
/*
[
  {
    name: "commandName",
    rank: 0,
    callback: "commandName"
  }
]
*/
```

#### *source*

`string` or `object`
The source of the commands.

```javascript
instance.source;
```
