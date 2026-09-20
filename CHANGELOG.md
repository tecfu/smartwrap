# Changelog

All notable changes to `smartwrap`, newest release first.
History is derived from git between releases (tags `v<version>`);
untagged history before v1.2.2 is in the git log.

## 4.0.0 (2026-09-20)

**Breaking**

- Display width is now measured by [`breakword.width()`](https://github.com/tecfu/breakword) instead of `wcwidth` — a generated Unicode 18.0.0 East Asian Width table plus UAX #51 `Emoji_Presentation`, no dependencies of its own. Output changes where the two disagree: code points `wcwidth` 1.x scored 1 cell but `breakword` scores 2 (e.g. `⚡` U+26A1) now wrap wider.
- Node.js >= 22 required (was 12+).

**Added**

- Expanded Unicode display-width test coverage (including combining marks).

## 3.0.0 (2026-09-20)

**Breaking**

- Source rewritten in TypeScript; `main` / `types` point at `dist/`.
- Removed unused `grapheme-splitter` and the `array.prototype.flat` polyfill.

**Added**

- Dual ESM/CJS exports, so both `import` and `require` work.
- GitHub Actions CI: Node 12–22, then 24 and 26; actions bumped to v5.

**Changed**

- Modernized for Node 12+, removed unused dependencies, fixed bugs (v3 release).

**Fixed**

- Over-long words now break in one pass instead of re-queuing the tail.

**Dependencies**

- mocha ^12 to fix serialize-javascript advisories (GHSA-5c6j-r48x-rmvq, GHSA-qj8w-gfj5-8c6v).

## 2.0.2 (2021-05-15)

- License file updated to MIT.
- Updated test containers and dependencies.

## 2.0.1 (2020-03-09)

- Backported to Node 6.

## 2.0.0 (2020-02-29)

- Fixed deduping of template literals with existing linebreaks.
- Requires Node > 11.

## 1.2.6 (2020-02-29)

- Fixed deduping of template literals with existing linebreaks.

## 1.2.5 (2020-02-25)

- Fixed string length calculation during ANSI restore.

## 1.2.4 (2020-02-25)

- Added preservation of ANSI escape sequences across line wraps.
- Refactor: cleaned config, added input validation method, lint fixes, husky pre-commit checks.

## 1.2.3 (2020-02-14)

- Fixed mishandling of emoji (surrogate pairs of Unicode code points).

## 1.2.2 (2020-02-11)

- First tagged release (wide-character wrapping, `breakword` option, template-literal support, tests).
  Untagged pre-1.2.2 history (2017–2020) adds `minWidth`, `trim`, `splitAt` options and early fixes; see the git log.
