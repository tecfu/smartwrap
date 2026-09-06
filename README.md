# smartwrap

Textwrap for JavaScript/Node.js.  
Correctly handles wide characters (宽字符) and emojis (😃).  
Optionally break words when wrapping strings. Preserves ANSI escape codes.

## Why?

JavaScript's `String.length` counts code units, not visual terminal width.  
Wide characters (CJK) and many emoji occupy 2 columns but have length 1.  
This package wraps text to a target **visual** width using `wcwidth`.

## Installation

```bash
npm install smartwrap
```

CLI (global):

```bash
npm install -g smartwrap
```

## Node module

### Wide character wrapping

```js
const smartwrap = require('smartwrap')
console.log(smartwrap('宽字符', { width: 2 }))
// 宽
// 字
// 符
```

### Word wrapping (default)

```js
console.log(smartwrap('break at word', {
  width: 10,
  breakword: false // default
}))
// break at
// word
```

### Force-break long words

```js
console.log(smartwrap('break at word', {
  width: 10,
  breakword: true
}))
// break at w
// ord
```

### Options

| Option         | Type     | Default     | Description |
|----------------|----------|-------------|-------------|
| `width`        | number   | `10`        | Target line width in terminal columns |
| `breakword`    | boolean  | `false`     | Break words that exceed remaining space |
| `minWidth`     | 1 \| 2   | `2`         | Minimum usable width (use `1` only if no wide chars) |
| `paddingLeft`  | number   | `0`         | Spaces prepended to each line |
| `paddingRight` | number   | `0`         | Spaces appended to each line |
| `splitAt`      | string[] | `[" ","\t"]`| Characters that split words |
| `trim`         | boolean  | `true`      | Trim leading/trailing whitespace from input |
| `errorChar`    | string   | `"�"`       | Replacement when a single wide char cannot fit |

## CLI

```bash
echo "somestring you want to wrap" | smartwrap --width=3 --paddingLeft=1
```

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

Run `smartwrap --help` for all flags.

## Breaking changes in 3.0.0

- **Node.js ≥ 12** required (native `Array.prototype.flat`).
- Removed unused `grapheme-splitter` and the `array.prototype.flat` polyfill (eliminates ~50 transitive dependencies).
- Updated `yargs` and other dependencies.
- CLI now correctly passes `breakword` and `errorChar`.
- Test runner switched from Grunt to plain Mocha.
- Minor code cleanups (fixed undeclared variable, modernized style).

Existing wrapping behavior for supported inputs is intentionally preserved.

## Compatibility

- Node.js ≥ 12
- CommonJS

## License

[MIT](https://opensource.org/licenses/MIT)
