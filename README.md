# smartwrap
Textwrap for javascript/nodejs. Correctly handles wide characters (宽字符) and emojis (😃). Automatically breaks long words.

## Examples:

### Terminal:
```sh
npm i -g smartwrap
echo somestring you want to wrap | smartwrap --width=3 --paddingLeft=1
```

### Output:
```
 so
 me
 st
 ri
 ng
 yo
 u
 wa
 nt
 to
 wr
 ap
```

## Node module:

```js
var Smartwrap = require('smartwrap');
var exampleText1 = '宽字符';
console.log(Smartwrap(exampleText1,{
	length : 2
}));
```
### Output:
```
宽
字
符
```
*Because these are wide characters and occupy 2 spaces, even though 
in javascript their string length is 1.

