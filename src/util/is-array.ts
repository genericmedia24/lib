/**
 * Checks whether a value is an array.
 *
 * The custom check function can be used to refine the type guard.
 *
 * @example
 * ```typescript
 * type Value = [1,2]
 *
 * const isValue = isArray<Value>([1,2], (value) => {
 *   return value[0] === 1 && value[1] === 2
 * })
 *
 * console.log(isValue) // true
 * ```
 *
 * @param value the value
 * @param check the custom check function
 */
export function isArray<T = unknown[]>(value: unknown, check?: (value: T) => boolean): value is T {
  return (
    Array.isArray(value) &&
    check?.(value as T) !== false
  )
}
