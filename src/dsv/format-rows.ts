import type { Primitive } from 'type-fest'
import type { FormatDsvOptions } from './format-options.js'
import { formatDsvRow } from './format-row.js'

/**
 * Formats rows of values.
 *
 * The rows will be joined with '\n'.
 *
 * See [the guide](../../docs/guides/dsv.md) for more information.
 *
 * @example
 * ```javascript
 * const string = formatDsvRows([
 *   ['a', 'b', 'c'],
 *   [1, 2, 3],
 * ])
 *
 * console.log(string === 'a,b,c\n1,2,3\n') // true
 * ```
 *
 * @param rows the rows of values
 * @param options the options
 */
export function formatDsvRows(rows: Array<Array<Date | Primitive | Uint8Array>>, options?: Partial<FormatDsvOptions>): string {
  const result = new Array(rows.length).fill('')

  for (let i = 0; i < rows.length; i += 1) {
    result[i] = formatDsvRow(rows[i], options)
  }

  return `${result.join('\n')}\n`
}
