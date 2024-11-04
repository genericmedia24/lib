/* eslint-disable no-console */

import parse from 'csv-simple-parser'
import { csvParseRows } from 'd3-dsv'
import { readFileSync } from 'node:fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { inferSchema, initParser } from 'udsv'
import { parseDsvRowToObject, parseDsvString } from '../../src/helpers/dsv.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()
const string = String(readFileSync(filename)).trim()

// console.log(parseDsvString(data, dsvRowToObject).slice(-1))
// console.log(initParser(inferSchema(data)).stringObjs(data).slice(-1))

bench
  .add('d3-dsv', () => {
    csvParseRows(string)
  })
  .add('dsv-simple-parser', () => {
    parse(string, {
      header: true,
    })
  })
  .add('papaparse', () => {
    papaparse.parse(string, {
      header: true,
    })
  })
  .add('udsv', () => {
    initParser(inferSchema(string)).stringObjs(string)
  })
  .add('parseDsvString', () => {
    const rows = []

    parseDsvString(string, parseDsvRowToObject((row) => {
      rows.push(row)
    }))
  })

await bench.run()

console.table(bench.table())
