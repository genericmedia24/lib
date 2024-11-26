/**
 * Checks whether a value is `null` or `undefined`.
 *
 * @example
 * ```javascript
 * console.log(isNil(undefined)) // true
 * console.log(isNil('undefined')) // false
 * ```
 *
 * @param value the value
 */
export function isNil(value: unknown): value is null | undefined {
  return (
    value === null ||
    value === undefined
  )
}
