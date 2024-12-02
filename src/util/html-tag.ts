import { isArray } from './is-array.js'
import { isNil } from './is-nil.js'
import { isObject } from './is-object.js'
import { isPrimitive } from './is-primitive.js'

export interface RawHtml {
  /**
   * The HTML string that should be rendered as-is.
   */
  raw: string
}

/**
 * HTML template tag.
 *
 * Four types of values are handled:
 *
 * 1. The value of a raw object is used as-is.
 * 2. An array is joined with an empty string.
 * 3. A primitive is stringified with `toString`, entities (&<>'") are encoded.
 * 4. Other values are replaced with an empty string.
 *
 * Trims the final result.
 *
 * @example
 * ```javascript
 * const value = 'abc&123'
 * const string = html`<div>${value}</div>`
 *
 * console.log(string === '<div>abc&#38;123</div>') // true
 * ```
 *
 * @param strings the strings
 * @param values the values
 */
export function html(strings: string | TemplateStringsArray, ...values: unknown[]): string {
  let i = 0
  let result = ''
  let value = undefined

  for (; i < values.length; i += 1) {
    value = values[i]

    if (isObject<RawHtml>(value, ({ raw }) => raw !== undefined)) {
      value = value.raw
    } else if (isArray(value)) {
      value = value.join('')
    } else {
      if (
        isPrimitive(value) &&
        !isNil(value)
      ) {
        value = value.toString()
      } else {
        value = ''
      }

      value = value.replace(/[&<>'"]/gu, (substring) => {
        return `&#${substring.charCodeAt(0)};`
      })
    }

    result += `${strings[i] ?? ''}${value}`
  }

  return (result + strings[i]).trim()
}

/**
 * Creates an object that can be interpreted by the HTML template tag.
 *
 * @example
 * ```javascript
 * const value = html.raw('abc&123')
 * const string = html`<div>${value}</div>`
 *
 * console.log(string === '<div>abc&123</div>') // true
 * ```
 *
 * @param raw the HTML string that should be rendered as-is
 */
html.raw = (raw: string): RawHtml => {
  return {
    raw,
  }
}
