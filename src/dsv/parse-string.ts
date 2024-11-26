import type { ParseDsvOptions } from './parse-options.js'
import type { ParseDsvState } from './parse-state.js'
import { parseDsv } from './parse.js'

/**
 * Parses a string.
 *
 * See [the guide](../../docs/guides/dsv.md) for more information.
 *
 * @example
 * ```javascript
 * const string = `a,b,c\n1,2,3\n`
 *
 * parseDsvString(string, (row) => {
 *   console.log(row) // [1, 2, 3] the second time
 * })
 * ```
 *
 * @param string the string
 * @param rowCallback the row callback function
 * @param options the options
 */
export function parseDsvString(string: string, rowCallback: (row: string[]) => void, options?: Partial<ParseDsvOptions>): void {
  const parseDsvOptions: ParseDsvOptions = {
    delimiter: options?.delimiter ?? ',',
    enclosing: options?.enclosing ?? '"',
  }

  const parseDsvState: ParseDsvState = {
    columnIndex: 0,
    row: [],
    string: string.endsWith('\n')
      ? string
      : `${string}\n`,
  }

  parseDsv(parseDsvState, rowCallback, parseDsvOptions)
}
