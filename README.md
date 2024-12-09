# @genericmedia/lib

[![release](https://img.shields.io/github/actions/workflow/status/genericmedia24/lib/release.yaml?color=%234c1&label=release)](https://github.com/genericmedia24/lib/actions/workflows/release.yaml)
[![npm](https://img.shields.io/npm/v/%40genericmedia%2Flib?color=%234c1&label=npm)](https://www.npmjs.com/genericmedia24/lib)

A library for building data-intensive web applications.

- [commander](./src/commander/README.md) - Declarative reactivity.
- [commands](./src/commands/README.md) - A collection of custom commands.
- [dsv](./src/dsv/README.md) - Easy & fast DSV parsing and formatting.
- [elements](./src/elements/README.md) - Custom elements using commander and state.
- [requester](./src/requester/README.md) - Easy & reactive URL fetching.
- [scroller](./src/scroller/README.md) - Smooth scrolling through tabular data.
- [state](./src/state/README.md) - State management.
- [util](./src/util/README.md) - Utility functions.

## Installation

```shell
npm add @genericmedia/lib
```

```shell
pnpm add @genericmedia/lib
```

```shell
yarn add @genericmedia/lib
```

## Usage

```javascript
// ESM local import
import { parseDsvStream } from "@genericmedia/lib"
```

```javascript
// ESM remote import
import { parseDsvStream } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib@1.6.1/+esm"
```

```javascript
// UMD local require
const gm = require("@genericmedia/lib")
```

```html
<!-- UMD remote script, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib@1.6.1/dist/browser.min.js"></script>
```

It is also possible to use subpaths for commander, commands, dsv, elements, requester, scroller, state and util.

```javascript
// ESM local import
import { parseDsvStream } from "@genericmedia/lib@1.6.1/dsv"
```

```html
<!-- UMD remote script, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib@1.6.1/dist/dsv.min.js"></script>
```

## License

This library is released under the [MIT License](LICENSE).
