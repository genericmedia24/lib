/* eslint-disable no-console */

import parse from 'csv-simple-parser'
import { csvParseRows } from 'd3-dsv'
import { readFileSync } from 'node:fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { inferSchema, initParser } from 'udsv'
import { parseDsvString } from '../../src/helpers/dsv.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()
const string = String(readFileSync(filename)).trim()

bench
  .add('d3-dsv', () => {
    csvParseRows(string)
  })
  .add('dsv-simple-parser', () => {
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
  .add('parseDsvString', () => {
    const rows = []

    parseDsvString(string, (row) => {
      rows.push(row)
    })
  })

await bench.run()

console.table(bench.table())
