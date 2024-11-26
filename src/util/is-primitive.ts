import type { Primitive } from 'type-fest'

/**
 * Checks whether a value is a primitive.
 *
 * @example
 * ```javascript
 * console.log(isPrimitive(123)) // true
 * console.log(isPrimitive({})) // false
 * ```
 *
 * @param value the value
 */
export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'symbol'
  )
}
