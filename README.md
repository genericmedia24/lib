# @genericmedia/lib

[![test](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgenericmedia24.github.io%2Flib%2Ftest-coverage.json&query=%24.percent&suffix=%25&color=%234c1&label=test)](https://genericmedia24.github.io/lib)
[![docs](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgenericmedia24.github.io%2Flib%2Fdocs-coverage.json&query=%24.percent&suffix=%25&color=%234c1&label=docs)](https://genericmedia24.github.io/lib)
[![release](https://img.shields.io/github/actions/workflow/status/genericmedia24/lib/release.yaml?color=%234c1&label=release)](https://github.com/genericmedia24/lib/actions/workflows/release.yaml)
[![npm](https://img.shields.io/npm/v/%40genericmedia%2Flib?color=%234c1&label=npm)](https://www.npmjs.com/genericmedia24/lib)

A library for building data-intensive web applications.

- [commander](https://genericmedia24.github.io/lib/documents/commander.html) - Declarative reactivity.
- [commands](https://genericmedia24.github.io/lib/modules/commands.html) - A collection of custom commands.
- [dsv](https://genericmedia24.github.io/lib/documents/dsv.html) - Easy & fast DSV parsing and formatting.
- [elements](https://genericmedia24.github.io/lib/modules/elements.html) - Custom elements using commander and state.
- [requester](https://genericmedia24.github.io/lib/modules/requester.html) - Easy & reactive URL fetching.
- [scroller](https://genericmedia24.github.io/lib/documents/scroller.html) - Smooth scrolling through tabular data.
- [state](https://genericmedia24.github.io/lib/documents/state.html) - State management.
- [util](https://genericmedia24.github.io/lib/modules/util.html) - Utility functions.

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
import { parseDsvStream } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm"
```

```javascript
// UMD local require
const gm = require("@genericmedia/lib")
```

```html
<!-- UMD remote script, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib/dist/browser.min.js"></script>
```

It is also possible to use subpaths for commander, commands, dsv, elements, requester, scroller, state and util.

```javascript
// ESM local import
import { parseDsvStream } from "@genericmedia/lib/dsv"
```

```html
<!-- UMD remote script, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib/dist/dsv.min.js"></script>
```

## License

This library is released under the [MIT License](LICENSE).
