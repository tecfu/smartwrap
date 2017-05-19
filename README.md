# smartwrap
Textwrap for javascript/nodejs. Correctly handles wide characters (宽字符) and emojis (😃). Automatically breaks long words.

## Usage:

```
var Smartwrap = require('smartwrap');
var exampleText1 = '宽字符';
console.log(Smartwrap(exampleText1,{
	length : 2
}));
```
### Outputs:
```
宽
字
符
```
