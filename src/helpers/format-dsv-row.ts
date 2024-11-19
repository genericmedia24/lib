import type { Primitive } from 'type-fest'
import type { FormatDsvOptions } from './format-dsv-options.js'
import { formatDsvValue } from './format-dsv-value.js'

/**
 * Formats a row of values.
 *
 * The values will be joined with the separator passed in the options (defaults to ',').
 *
 * @example
 * ```javascript
 * const string = formatDsvRow(['a', 'b', 'c'])
 *
 * console.log(string === 'a,b,c') // true
 * ```
 *
 * @param row the row of values
 * @param options the options
 */
export function formatDsvRow(row: Array<Date | Primitive | Uint8Array>, options?: Partial<FormatDsvOptions>): string {
  const result = new Array(row.length).fill('')

  for (let i = 0; i < row.length; i += 1) {
    result[i] = formatDsvValue(row[i], options)
  }

  return result.join(options?.delimiter ?? ',')
}
