import type { Primitive } from 'type-fest'
import type { FormatDsvOptions } from './format-options.js'

const decoder = new TextDecoder()

/**
 * Formats a value.
 *
 * Four different cases are handled:
 *
 * 1. `undefined` and `null` are returned as `'NULL'`.
 * 2. A Date is formatted by calling its `toISOString`.
 * 3. A `Uin8Array` is formatted as base64 if it is a `Buffer` or decoded with a `TextDecoder` otherwise.
 * 4. Every other value is formatted with `String()`, possibly enclosed when the value contains '\n', '\r', the delimiter string or the enclosing string.
 *
 * @example
 * ```javascript
 * console.log(formatDsvValue(null) === 'NULL') // true
 * console.log(formatDsvValue(1) === '1') // true
 * console.log(formatDsvValue(new Date(0)) === '1970-01-01T00:00:00.000Z') // true
 * console.log(formatDsvValue('a"b') === '"a""b"') // true
 * ```
 *
 * @param value the value
 * @param options the options
 */
export function formatDsvValue(value: Date | Primitive | Uint8Array, options?: Partial<FormatDsvOptions>): string {
  let result = ''

  if (
    value === null ||
    value === undefined
  ) {
    result = 'NULL'
  } else if (value instanceof Date) {
    result = value.toISOString()
  } else if (value instanceof Uint8Array) {
    result = decoder.decode(value)
  } else {
    const delimiter = options?.delimiter ?? ','
    const enclosing = options?.enclosing ?? '"'

    result = String(value)

    result = (
      result.includes(delimiter) ||
      result.includes(enclosing) ||
      result.includes('\n') ||
      result.includes('\r')
    )
      ? enclosing + result.replaceAll(enclosing, enclosing + enclosing) + enclosing
      : result
  }

  return result
}
