import * as marked from 'marked'
import { MessageFormat, type MessageFormatOptions } from 'messageformat'
import xss from 'xss'

export interface I18nOptions {
  locale?: string
  locales?: Record<string, Record<string, string>>
  timeZone?: string
}

export interface I18nFormatHtmlOptions {
  parse?: marked.MarkedOptions
  sanitize?: XSS.IFilterXSSOptions
}

export interface I18nFormatStringOptions extends MessageFormatOptions {
  default?: string
  params?: Record<string, unknown>
}

marked.use({
  breaks: true,
  gfm: true,
})

export class I18n {
  private static instance?: I18n

  public static create(options?: I18nOptions): I18n {
    I18n.instance ??= new I18n(options)
    return I18n.instance
  }

  public locale: string

  public locales: Record<string, Record<string, string>>

  public timeZone: string

  public constructor(options?: I18nOptions) {
    this.locale = options?.locale ?? 'en-US'
    this.locales = options?.locales ?? {}
    this.timeZone = options?.timeZone ?? 'UTC'
  }

  public formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Date(value).toLocaleString(this.locale, options)
  }

  public formatHtml(value: string, options?: I18nFormatHtmlOptions): string {
    return xss(marked.parse(value, options?.parse) as string, options?.sanitize)
  }

  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return value.toLocaleString(this.locale, options)
  }

  public formatRelativeTime(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(value)
    const diff = Date.now() - date.valueOf()

    if (diff > (24 * 60 * 60 * 1000)) {
      return date.toLocaleDateString(this.locale, {
        day: 'numeric',
        month: 'short',
        ...options,
      })
    }

    return date.toLocaleTimeString(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    })
  }

  public formatString(value: string, options?: I18nFormatStringOptions): string {
    try {
      const source = this.locales[this.locale]?.[value] ?? options?.default ?? value
      const messageFormat = new MessageFormat(this.locale, source, options)
      return messageFormat.format(options?.params)
    } catch (error: unknown) {
      console.error(error)
      return ''
    }
  }
}
