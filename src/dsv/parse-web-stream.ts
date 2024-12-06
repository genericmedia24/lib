import type { ParseDsvOptions } from './parse-options.js'
import type { ParseDsvState } from './parse-state.js'
import { parseDsv } from './parse.js'

const decoder = new TextDecoder()

/**
 * Parses a web stream.
 *
 * @example
 * ```javascript
 * const response = fetch('some-file.csv')
 *
 * parseDsvWebStream(response.body, (row) => {
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
export function parseDsvWebStream(stream: ReadableStream, rowCallback: (row: string[]) => void, endCallback: (error?: unknown) => void, options?: Partial<ParseDsvOptions>): ReadableStreamDefaultReader {
  const reader = stream.getReader()

  const parseDsvOptions: ParseDsvOptions = {
    delimiter: options?.delimiter ?? ',',
    enclosing: options?.enclosing ?? '"',
  }

  const parseDsvState: ParseDsvState = {
    columnIndex: 0,
    row: [],
    string: '',
  }

  const handleRead = ({ done, value }: ReadableStreamReadResult<Uint8Array>): void => {
    if (value !== undefined) {
      parseDsvState.string += decoder.decode(value)
    }

    if (done) {
      if (parseDsvState.string.length > 0) {
        if (!parseDsvState.string.endsWith('\n')) {
          parseDsvState.string = `${parseDsvState.string}\n`
        }

        parseDsv(parseDsvState, rowCallback, parseDsvOptions)
      }

      endCallback()

      return
    }

    parseDsv(parseDsvState, rowCallback, parseDsvOptions)

    reader
      .read()
      .then(handleRead)
      .catch(endCallback)
  }

  reader
    .read()
    .then(handleRead)
    .catch(endCallback)

  return reader
}
