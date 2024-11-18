import { csvFormatRows } from 'd3-dsv'
import { readFileSync } from 'fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { formatDsvRows, parseDsvString } from '../../src/helpers/dsv.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()
const rows: string[][] = []

parseDsvString(String(readFileSync(filename)).trim(), (row) => {
  rows.push(row)
})

bench
  .add('d3-dsv', () => {
    csvFormatRows(rows)
  })
  .add('papaparse', () => {
    papaparse.unparse(rows)
  })
  .add('formatDsv', () => {
    formatDsvRows(rows)
  })

await bench.run()

console.table(bench.table())
