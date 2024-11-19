import { isObject } from './is-object.js'
import { isPrimitive } from './is-primitive.js'

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
    } else if (isPrimitive(value)) {
      value = value
        ?.toString()
        .replace(/[&<>'"]/gu, (substring) => {
          return `&#${substring.charCodeAt(0)};`
        }) ?? ''
    } else {
      value = ''
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
