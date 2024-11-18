import { MessageFormat, type MessageFormatOptions } from 'messageformat'

export interface I18nOptions {
  locale?: string
  locales?: Record<string, Record<string, string>>
  timeZone?: string
}

export interface I18nFormatStringOptions extends MessageFormatOptions {
  params?: Record<string, unknown>
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

  public formatString(value: string, options?: I18nFormatStringOptions): string {
    return new MessageFormat(
      this.locale,
      this.locales[this.locale]?.[value] ?? value,
      options,
    ).format(options?.params)
  }
}
