# smartwrap

Textwrap for JavaScript/Node.js, written in **TypeScript**.  
Correctly handles wide characters (宽字符) and emojis (😃).  
Optionally break words when wrapping strings. Preserves ANSI escape codes.

Ships compiled CommonJS + declaration files (`.d.ts`).

## Installation

```bash
npm install smartwrap
```

CLI (global):

```bash
npm install -g smartwrap
```

## Usage

```ts
// ESM
import smartwrap from 'smartwrap'
// or: import { smartwrap } from 'smartwrap'

// CommonJS
const smartwrap = require('smartwrap')

console.log(smartwrap('宽字符', { width: 2 }))
// 宽
// 字
// 符
```

```ts
console.log(smartwrap('break at word', { width: 10 }))
// break at
// word
```

```ts
console.log(smartwrap('break at word', { width: 10, breakword: true }))
// break at w
// ord
```

### Options (`SmartwrapOptions`)

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
smartwrap --help
```

## Development

```bash
npm install
npm run build   # tsc → dist/
npm test
```

Source is pure TypeScript under `src/`. Published artifacts live in `dist/`.

## Breaking changes in 3.0.0

- **Node.js ≥ 22** required (matches breakword@2.1.0).
- Source rewritten in TypeScript; `main` / `types` point at `dist/`.
- Removed unused `grapheme-splitter` and the `array.prototype.flat` polyfill.
- See prior changelog notes on the modernize release for dependency cleanup details.

## License

[MIT](https://opensource.org/licenses/MIT)
