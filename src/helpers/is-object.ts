/**
 * Checks whether a value is an object.
 *
 * The custom check function can be used to refine the type guard.
 *
 * @example
 * ```typescript
 * interface Value {
 *   a: 1
 * }
 *
 * const isValue = isObject<Value>({ a: 1 }, (value) => {
 *   return value.a === 1
 * })
 *
 * console.log(isValue) // true
 * ```
 *
 * @param value the value
 * @param check the custom check function
 */
export function isObject<T = Record<string, unknown>>(value: unknown, check?: (value: Partial<T>) => boolean): value is T {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    check?.(value) !== false
  )
}
