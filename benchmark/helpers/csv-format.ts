/* eslint-disable no-console */

import { csvFormatRows } from 'd3-dsv'
import { readFileSync } from 'fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { formatCsvRows, parseCsvString } from '../../src/helpers/csv.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()
const data = parseCsvString(String(readFileSync(filename)).trim())

bench
  .add('d3-dsv', () => {
    csvFormatRows(data)
  })
  .add('papaparse', () => {
    papaparse.unparse(data)
  })
  .add('formatCsv', () => {
    formatCsvRows(data)
  })

await bench.run()

console.table(bench.table())
