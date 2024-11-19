# @genericmedia/lib

[![Build Status](https://github.com/genericmedia24/lib/actions/workflows/release.yaml/badge.svg)](https://github.com/genericmedia24/lib/actions/workflows/release.yaml)
[![Published on npm](https://img.shields.io/npm/v/%40genericmedia%2Flib)](https://www.npmjs.com/genericmedia24/lib)

## Installation

```shell
npm install @genericmedia/lib
```

## Usage

### Browser

```html
<!-- ESM -->
<script type="module">
  import gm from 'https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm'
</script>

<!-- UMD, "gm" is globally available -->
<script src="https://cdn.jsdelivr.net/npm/@genericmedia/lib"></script>
```

### Other

```javascript
// ESM
import gm from '@genericmedia/lib'

// CJS
const gm = require('@genericmedia/lib')
```

## Documentation

The documentation can be found on [genericmedia24.github.io/lib](https://genericmedia24.github.io/lib).

It contains four guides:

1. [Custom Commands](./docs/guides/custom-commands.md) - declarative, stateful reactivity.
2. [DSV](./docs/guides/dsv.md) - fast and easy CSV and TSV parsing and formatting.
3. [Scroller](./docs/guides/scroller.md) - smooth scrolling through large tables.
4. [Util](./docs/guides/util.md) - some utility functions.

The rest of the documentations contains auto-generated API descriptions.

## Contribution

Please file an [issue](https://github.com/genericmedia24/lib/issues/new) or create a [pull request](https://github.com/genericmedia24/lib/compare) if you find a bug or have a suggestion for improvement.
