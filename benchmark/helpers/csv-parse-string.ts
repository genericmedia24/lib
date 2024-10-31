/* eslint-disable no-console */

import parse from 'csv-simple-parser'
import { csvParseRows } from 'd3-dsv'
import { readFileSync } from 'node:fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { inferSchema, initParser } from 'udsv'
import { parseCsvString } from '../../src/helpers/csv.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()
const data = String(readFileSync(filename)).trim()

bench
  .add('d3-dsv', () => {
    csvParseRows(data)
  })
  .add('csv-simple-parser', () => {
    parse(data)
  })
  .add('papaparse', () => {
    papaparse.parse(data)
  })
  .add('udsv', () => {
    initParser(inferSchema(data, {
      header: () => [],
    })).stringArrs(data)
  })
  .add('parseCsvString', () => {
    parseCsvString(data)
  })

await bench.run()

console.table(bench.table())
