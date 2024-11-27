# DSV

There are quite a few RFC 4180 compliant libraries that can parse and/or format delimiter-separated (DSV) data. Some are fast and some are not, some can parse and others cannot, some can handle streams and some cannot, some are easy to call and others are not.

This library contains functions to parse and format DSV strings and streams very easily and very fast.

There are no type parsers, because it is more efficient to parse a value JIT when it has to be used in a computation or when it has to be rendered, instead of parsing all values all the time. Besides, type guessing is hard.

## Parse

### Parse string

```javascript
import { parseDsvString } from '@genericmedia/lib'

const string = `a,b,c\n1,2,3\n`

parseDsvString(string, (row) => {
  console.log(row) // ['1', '2', '3'] the second time
})
```

### Parse stream

```javascript
import { parseDsvStream } from '@genericmedia/lib'
import { createReadStream } from 'node:fs'

const stream = createReadStream('some-file.csv')

// prettier-ignore
parseDsvStream(stream, (row) => {
  console.log(row)
}, () => {
  console.log('done')
})
```

### Parse web stream

```javascript
import { parseDsvWebStream } from '@genericmedia/lib'

const response = fetch('some-file.csv')

// prettier-ignore
parseDsvWebStream(response.body, (row) => {
  console.log(row)
}, () => {
  console.log('done')
})
```

### Parse to object

```javascript
// prettier-ignore
import {
  parseDsvRowToObject,
  parseDsvString
} from '@genericmedia/lib'

const string = `a,b,c\n1,2,3\n`

// prettier-ignore
parseDsvString(string, parseDsvRowToObject((object) => {
  console.log(object.a === '1') // true
}))
```

### Parse with options

```javascript
import { parseDsvString } from '@genericmedia/lib'

const string = `a\tb\tc\n1\t2\t3\n`

// prettier-ignore
parseDsvString(string, (row) => {
  console.log(row) // ['1', '2', '3'] the second time
}, {
  delimiter: '\t'
})
```

## Format

### Format rows

```javascript
import { formatDsvRows } from '@genericmedia/lib'

const string = formatDsvRows([
  ['a', 'b', 'c'],
  [1, 2, 3],
])

console.log(string === 'a,b,c\n1,2,3\n') // true
```

### Format with options

```javascript
import { formatDsvRows } from '@genericmedia/lib'

// prettier-ignore
const string = formatDsvRows([
  ['a', 'b', 'c'],
  [1, 2, 3],
], {
  delimiter: '\t'
})

console.log(string === 'a\tb\tc\n1\t2\t3\n') // true
```

## Benchmarks

Never take the outcome of a benchmark literally, just seriously. [uDSV](https://github.com/leeoniya/uDSV/) is sometimes faster than genericmedia, but the rest is never faster than both.

[Tinybench](https://github.com/tinylibs/tinybench) was used to run the benchmark.

The CSV files were generated with https://github.com/leeoniya/uDSV/blob/main/bench/litmus_gen.cjs.

### Parse

```javascript
npx tsx benchmark/dsv/parse-string-to-array.ts benchmark/dsv/unquoted.csv
```

| Task name         | Latency average (ns) | Latency median (ns)     | Throughput average (ops/s) | Throughput median (ops/s) | Samples |
| ----------------- | -------------------- | ----------------------- | -------------------------- | ------------------------- | ------- |
| d3-dsv            | 33950617.80 ± 2.73%  | 32413398.00 ± 9763.00   | 30 ± 2.86%                 | 31                        | 64      |
| csv-simple-parser | 14708172.38 ± 1.35%  | 14582519.50 ± 206674.50 | 68 ± 1.21%                 | 69 ± 1                    | 68      |
| papaparse         | 26732179.67 ± 3.86%  | 26391124.00 ± 2119.00   | 38 ± 3.86%                 | 38                        | 64      |
| udsv              | 7734209.72 ± 3.90%   | 7443719.50 ± 18900.50   | 133 ± 2.39%                | 134                       | 130     |
| genericmedia      | 7557958.06 ± 3.04%   | 7325752.00              | 134 ± 1.58%                | 137                       | 133     |

```javascript
npx tsx benchmark/dsv/parse-stream-to-array.ts benchmark/helpers/quoted.csv
```

| Task name    | Latency average (ns) | Latency median (ns)    | Throughput average (ops/s) | Throughput median (ops/s) | Samples |
| ------------ | -------------------- | ---------------------- | -------------------------- | ------------------------- | ------- |
| papaparse    | 87931655.36 ± 0.96%  | 87778790.00 ± 636.00   | 11 ± 0.96%                 | 11                        | 64      |
| udsv         | 19950393.16 ± 5.02%  | 18568834.00 ± 22122.00 | 52 ± 3.83%                 | 54                        | 64      |
| genericmedia | 16047405.69 ± 0.63%  | 15988962.00 ± 7775.00  | 62 ± 0.62%                 | 63                        | 64      |

### Format

```javascript
npx tsx benchmark/dsv/format.ts benchmark/dsv/quoted.csv
```

| Task name    | Latency average (ns) | Latency median (ns)    | Throughput average (ops/s) | Throughput median (ops/s) | Samples |
| ------------ | -------------------- | ---------------------- | -------------------------- | ------------------------- | ------- |
| d3-dsv       | 26925453.27 ± 0.60%  | 26527286.00 ± 4243.00  | 37 ± 0.59%                 | 38                        | 64      |
| papaparse    | 46046602.80 ± 3.72%  | 50690595.50 ± 19035.50 | 22 ± 4.44%                 | 20                        | 64      |
| genericmedia | 16261152.91 ± 1.59%  | 16116684.50 ± 24185.50 | 62 ± 1.50%                 | 62                        | 64      |
