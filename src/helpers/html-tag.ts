import { encode } from 'html-entities'

export interface RawHtml {
  raw: string
}

export function html(strings: string | TemplateStringsArray, ...values: unknown[]): string {
  let i = 0
  let result = ''
  let value = undefined

  for (; i < values.length; i += 1) {
    value = values[i]

    if (Array.isArray(value)) {
      value = value.join('')
    } else if (html.isRaw(value)) {
      value = value.raw
    } else {
      value = encode(String(value))
    }

    result += `${strings[i] ?? ''}${value}`
  }

  return (result + strings[i]).trim()
}

html.isRaw = (value: unknown): value is RawHtml => {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as RawHtml).raw === 'string'
  )
}

html.raw = (raw: string): RawHtml => {
  return {
    raw,
  }
}
