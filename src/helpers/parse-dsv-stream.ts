import type { Readable } from 'node:stream'
import type { ParseDsvOptions } from './parse-dsv-options.js'
import type { ParseDsvState } from './parse-dsv-state.js'
import { parseDsv } from './parse-dsv.js'

const decoder = new TextDecoder()

/**
 * Parses a stream.
 *
 * @example
 * ```javascript
 * const stream = fs.createReadStream('some-file.csv')
 *
 * parseDsvStream(stream, (row) => {
 *   console.log(row)
 * }, () => {
 *   console.log('done')
 * })
 * ```
 *
 * @param stream the stream
 * @param rowCallback the row callback function
 * @param endCallback the end callback function
 * @param options the options
 */
export function parseDsvStream(stream: Readable, rowCallback: (row: string[]) => void, endCallback: (error?: unknown) => void, options?: Partial<ParseDsvOptions>): Readable {
  const parseDsvOptions: ParseDsvOptions = {
    delimiter: options?.delimiter ?? ',',
    enclosing: options?.enclosing ?? '"',
  }

  const parseDsvState: ParseDsvState = {
    columnIndex: 0,
    row: [],
    string: '',
  }

  stream.on('data', (chunk: Buffer) => {
    parseDsvState.string += decoder.decode(chunk)

    if (parseDsvState.string.includes('\n')) {
      parseDsv(parseDsvState, rowCallback, parseDsvOptions)
    }
  })

  stream.on('error', endCallback)

  stream.on('end', () => {
    if (parseDsvState.string.length > 0) {
      if (!parseDsvState.string.endsWith('\n')) {
        parseDsvState.string = `${parseDsvState.string}\n`
      }

      parseDsv(parseDsvState, rowCallback, parseDsvOptions)
    }

    endCallback()
  })

  return stream
}
