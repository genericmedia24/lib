import { createReadStream } from 'node:fs'
import papaparse from 'papaparse'
import { Bench } from 'tinybench'
import { inferSchema, initParser, type Parser, type stringRec } from 'udsv'
import { parseDsvRowToObject, parseDsvStream } from '../../src/helpers/dsv.js'

const [,,filename] = process.argv

if (filename === undefined) {
  throw new Error('Filename is undefined')
}

const bench = new Bench()

bench
  .add('papaparse', async () => {
    await new Promise((resolve) => {
      const readableStream = createReadStream(filename)
      const rows: unknown[] = []

      papaparse.parse(readableStream, {
        chunk: (result) => {
          rows.push(...result.data)
        },
        complete: () => {
          resolve(rows)
        },
        header: true,
      })
    })
  })
  .add('udsv', async () => {
    await new Promise((resolve) => {
      const readableStream = createReadStream(filename)
      let parser: null | Parser = null

      readableStream.on('data', (chunk) => {
        const strChunk = chunk.toString()
        parser ??= initParser(inferSchema(strChunk))
        parser.chunk<stringRec>(strChunk, parser.stringObjs)
      })

      readableStream.on('end', () => {
        resolve(parser?.end())
      })
    })
  })
  .add('parseDsvString', async () => {
    await new Promise((resolve) => {
      const readableStream = createReadStream(filename)
      const rows: unknown[] = []

      parseDsvStream(readableStream, parseDsvRowToObject((row) => {
        rows.push(row)
      }), () => {
        resolve(rows)
      })
    })
  })

await bench.run()

console.table(bench.table())
