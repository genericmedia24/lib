import parse from 'csv-simple-parser'
import { csvParseRows } from 'd3-dsv'
import { readFileSync } from 'node:fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { inferSchema, initParser } from 'udsv'
import { parseDsvString } from '../../src/dsv/parse-string.js'

const [,,filename] = process.argv

if (typeof filename === 'undefined') {
  throw new Error('Filename is undefined')
}

const bench = new Bench()

const string = readFileSync(filename)
  .toString()
  .trim()

bench
  .add('d3-dsv', () => {
    csvParseRows(string)
  })
  .add('csv-simple-parser', () => {
    parse(string)
  })
  .add('papaparse', () => {
    papaparse.parse(string)
  })
  .add('udsv', () => {
    initParser(inferSchema(string, {
      header: () => [],
    })).stringArrs(string)
  })
  .add('genericmedia', () => {
    const rows = []

    parseDsvString(string, (row) => {
      rows.push(row)
    })
  })

await bench.run()
console.table(bench.table())
