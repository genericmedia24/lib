import { isArray } from './is-array.js'
import { isPrimitive } from './is-primitive.js'

/**
 * SQL template tag.
 *
 * Three cases are handled:
 *
 * 1. A primitive is stringified with `toString`.
 * 2. An array is joined with a space.
 * 3. Other values are replaced with an empty string.
 *
 * Parameters are not escaped, so this tag should only be used for syntax highlighting.
 *
 * @example
 *
 * ```javascript
 * const value = 123
 * const query = sql`SELECT * FROM table WHERE value = ${value}`
 *
 * console.log(query === 'SELECT * FROM table WHERE value = 123') // true
 * ```
 *
 * @param strings the strings
 * @param values the values
 */
export function sql(strings: string | TemplateStringsArray, ...values: unknown[]): string {
  let i = 0
  let result = ''
  let value = undefined

  for (; i < values.length; i += 1) {
    value = values[i]

    if (isPrimitive(value)) {
      value = value?.toString() ?? ''
    } else if (isArray(value)) {
      value = value.join(' ')
    } else {
      value = ''
    }

    result += `${strings[i] ?? ''}${value}`
  }

  return (result + strings[i]).trim()
}
