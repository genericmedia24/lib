export function isArray<T = unknown[]>(value: unknown, check?: (value: T) => boolean): value is T {
  return (
    Array.isArray(value) &&
    check?.(value as T) !== false
  )
}
