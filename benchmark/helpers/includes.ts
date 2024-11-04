/* eslint-disable no-console */

import { Bench } from 'tinybench'

const bench = new Bench()

const string = 'abcd\ndefg",xyz\r123'

bench
  .add('includes', () => {
    return (
      string.includes('"') ||
      string.includes(',') ||
      string.includes('\r') ||
      string.includes('\n')
    )
  })
  .add('regexp', () => {
    return /[",\r\n]/u.test(string)
  })

await bench.run()

console.table(bench.table())
