import { sprintf } from 'sprintf-js'

export interface I18nOptions {
  /**
   * The locale, for example `'nl-NL'`.
   */
  locale?: string

  /**
   * The locales. The key is the locale, for example `'nl-NL'`, and the value is an object with strings of which the key is the string code and the value the actual string.
   */
  locales?: Record<string, Record<string, string>>

  /**
   * The timezone identifier, for example `'Europe/Amsterdam'`.
   */
  timeZone?: string
}

/**
 * An I18n helper.
 *
 * @example
 * ```javascript
 * const i18n = new I18n({
 *   locale: 'nl-NL',
 *   locales: {
 *     'nl-NL': {
 *       message: 'Hallo %(name)s',
 *     },
 *   },
 *   timeZone: 'Europe/Amsterdam',
 * })
 *
 * const string = i18n.formatString('message', {
 *   name: 'Wereld'
 * })
 *
 * console.log(string === 'Hallo Wereld') // true
 * ```
 */
export class I18n {
  /**
   * The singleton I18n helper.
   */
  private static instance?: I18n

  /**
   * Creates a singleton I18n helper. Useful in a browser application.
   *
   * @example
   * ```javascript
   * // Instantiate once with all the options at the top of the application
   * const i18n = I18n.create({
   *   locale: 'nl-NL',
   *   ...
   * })
   *
   * // Instantiate anywhere without options
   * const i18n = I18n.create()
   * ```
   *
   * @param options the options
   */
  public static create(options?: I18nOptions): I18n {
    if (I18n.instance === undefined) {
      I18n.instance = new I18n(options)
    }

    return I18n.instance
  }

  /**
   * The locale, for example `'nl-NL'`.
   */
  public locale: string

  /**
   * The locale definitions. The key is the locale, for example `'nl-NL'`, and the value is an object with strings of which the key is the string code and the value the actual string.
   */
  public locales: Record<string, Record<string, string> | undefined>

  /**
   * The timezone identifier, for example `'Europe/Amsterdam'`.
   */
  public timeZone: string

  /**
   * Creates an I18n helper.
   *
   * @param options the options
   */
  public constructor(options?: I18nOptions) {
    this.locales = options?.locales ?? {}
    this.locale = options?.locale ?? 'nl-NL'
    this.timeZone = options?.timeZone ?? 'Europe/Amsterdam'
  }

  /**
   * Formats a date according to the defined locale.
   *
   * @example
   * ```javascript
   * const date = i18n.formatDate(new Date('2024-07-01'), {
   *   dateStyle: 'short'
   * })
   *
   * console.log(date === '01-07-2024') // true
   * ```
   *
   * @param value the date
   * @param options the options as [Intl.DateTimeFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions)
   */
  public formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Date(value).toLocaleString(this.locale, options)
  }

  /**
   * Formats a number according to the defined locale.
   *
   * @example
   * ```javascript
   * const number = i18n.formatNumber(8080.80, {
   *   minimumFractionDigits: 2
   * })
   *
   * console.log(number === '8.080,80') // true
   * ```
   *
   * @param value the number
   * @param options the options as [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/resolvedOptions)
   */
  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return value.toLocaleString(this.locale, options)
  }

  /**
   * Formats a string according to the defined locale.
   *
   * Looks up the value in the locale, using the value as a code. If the code is not found, the value is used as-is.
   *
   * Uses [sprintf](https://www.npmjs.com/package/sprintf-js#named-arguments) to interpolate parameters defined in the string.
   *
   * @example
   * ```javascript
   * const string = i18n.formatString('message', {
   *   name: 'Wereld'
   * })
   *
   * console.log(string === 'Hallo Wereld') // true
   * ```
   *
   * @param value the value
   * @param parameters the parameters defined in the string
   */
  public formatString(value: string, parameters: Record<string, unknown> = {}): string {
    return sprintf(this.locales[this.locale]?.[value] ?? value, parameters)
  }
}
