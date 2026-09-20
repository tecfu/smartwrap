# smartwrap

Textwrap for JavaScript/Node.js, written in **TypeScript**.  
Correctly handles wide characters (宽字符) and emojis (😃).  
Optionally break words when wrapping strings. Preserves ANSI escape codes.

Ships compiled CommonJS + ESM + declaration files (`.d.ts`).

## Installation

**Library only** (no CLI, no `yargs`):

```bash
npm install smartwrap
```

**CLI** (separate package):

```bash
npm install -g smartwrap-cli
```

| Install | Package | Contents |
|---------|---------|----------|
| `npm install smartwrap` | **smartwrap** | Core library only |
| `npm install -g smartwrap-cli` | **smartwrap-cli** | `smartwrap` binary + yargs |

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

The CLI lives in `packages/smartwrap-cli` and is published separately as `smartwrap-cli`.

## Breaking changes in 3.0.0

- **Node.js ≥ 14** required.
- Source rewritten in TypeScript; `main` / `types` point at `dist/`.
- CLI moved to the separate **`smartwrap-cli`** package (core no longer depends on `yargs`).
- Removed unused `grapheme-splitter`, `breakword`, and the `array.prototype.flat` polyfill.

## License

[MIT](https://opensource.org/licenses/MIT)
