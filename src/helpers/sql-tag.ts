export function sql(strings: string | TemplateStringsArray, ...values: unknown[]): string {
  let i = 0
  let result = ''
  let value = undefined

  for (; i < values.length; i += 1) {
    value = values[i]

    if (Array.isArray(value)) {
      value = value.join(' ')
    } else {
      value = String(value)
    }

    result += `${strings[i] ?? ''}${value}`
  }

  return (result + strings[i]).trim()
}
