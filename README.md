# @genericmedia/lib

[![Build Status](https://github.com/genericmedia24/lib/actions/workflows/release.yaml/badge.svg)](https://github.com/genericmedia24/lib/actions/workflows/release.yaml)
[![Published on npm](https://img.shields.io/npm/v/%40genericmedia%2Flib)](https://www.npmjs.com/genericmedia24/lib)

A library for building data-intensive web applications.

- [commander](https://genericmedia24.github.io/lib/documents/commander.html) - Declarative reactivity.
- [commands](https://genericmedia24.github.io/lib/modules/commands.html) - A collection of custom commands.
- [dsv](https://genericmedia24.github.io/lib/documents/dsv.html) - Easy & fast CSV/TSV parsing and formatting.
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
import { parseDsvStream } from '@genericmedia/lib'
```

```javascript
// ESM remote import
import { parseDsvStream } from 'https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm'
```

```javascript
// UMD local require
const gm = require('@genericmedia/lib')
```

```html
<!-- UMD remote script, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib/dist/browser.min.js"></script>
```

It is also possible to use subpaths for commander, commands, dsv, elements, requester, scroller, state and util.

```javascript
// ESM local import
import { parseDsvStream } from '@genericmedia/lib/dsv'
```

```html
<!-- UMD remote script, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib/dist/dsv.min.js"></script>
```

## License

This library is released under the [MIT License](LICENSE).
