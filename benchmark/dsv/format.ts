import { csvFormatRows } from 'd3-dsv'
import { readFileSync } from 'fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { formatDsvRows } from '../../src/dsv/format-rows.js'
import { parseDsvString } from '../../src/dsv/parse-string.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()
const rows: string[][] = []

const string = readFileSync(filename)
  .toString()
  .trim()

parseDsvString(string, (row) => {
  rows.push(row)
})

bench
  .add('d3-dsv', () => {
    csvFormatRows(rows)
  })
  .add('papaparse', () => {
    papaparse.unparse(rows)
  })
  .add('genericmedia', () => {
    formatDsvRows(rows)
  })

await bench.run()
console.table(bench.table())
