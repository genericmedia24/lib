import { encode } from 'html-entities'
import { isObject } from './is-object.js'

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
    } else if (isObject<RawHtml>(value, ({ raw }) => raw !== undefined)) {
      value = value.raw
    } else {
      value = encode(String(value))
    }

    result += `${strings[i] ?? ''}${value}`
  }

  return (result + strings[i]).trim()
}

html.raw = (raw: string): RawHtml => {
  return {
    raw,
  }
}
