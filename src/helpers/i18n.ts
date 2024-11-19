import { sprintf } from 'sprintf-js'

export interface I18nOptions {
  locale?: string
  locales?: Record<string, Record<string, string>>
  timeZone?: string
}

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
    this.locale = options?.locale ?? 'en-GB'
    this.locales = options?.locales ?? {}
    this.timeZone = options?.timeZone ?? 'UTC'
  }

  public formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Date(value).toLocaleString(this.locale, options)
  }

  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return value.toLocaleString(this.locale, options)
  }

  public formatString(value: string, params?: Record<string, unknown>): string {
    return sprintf(this.locales[this.locale]?.[value] ?? value, params)
  }
}
