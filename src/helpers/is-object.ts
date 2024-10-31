export function isObject<T = Record<string, unknown>>(value: unknown, check?: (value: Partial<T>) => boolean): value is T {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    check?.(value) !== false
  )
}
