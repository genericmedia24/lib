import data from './calculator-data.json'

/**
 * Adapted from moment.js
 */
export class Calculator {
  firstDayOfWeek: number

  firstWeekOfYearDay: number

  language: string

  constructor(language: string) {
    this.language = language

    let localeIndex = data.indexOf(this.language.toLowerCase())

    if (localeIndex === -1) {
      localeIndex = data.indexOf(
        this.language
          .toLowerCase()
          .split('-')
          .shift() ?? 'en',
      )

      if (localeIndex === -1) {
        localeIndex = 0
      }
    }

    const [
      firstDayOfWeek,
      firstWeekOfYearDay,
    ] = data.slice(localeIndex + 1, localeIndex + 3)

    this.firstDayOfWeek = Number(firstDayOfWeek)
    this.firstWeekOfYearDay = Number(firstWeekOfYearDay)
  }

  getWeekNumber(date: Date): number {
    const weekOffset = this.#firstWeekOffset(date.getFullYear())
    let week = Math.floor((this.#dayOfYear(date) - weekOffset - 1) / 7) + 1

    if (week < 1) {
      week += this.#weeksInYear(date.getFullYear() - 1)
    } else {
      const weeksInYear = this.#weeksInYear(date.getFullYear())

      if (week > weeksInYear) {
        week -= weeksInYear
      }
    }

    return week
  }

  #dayOfYear(date: Date): number {
    return (
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)
    ) / 86400000
  }

  #daysInYear(year: number): number {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
      ? 366
      : 365
  }

  #firstWeekOffset(year: number): number {
    const firstWeekDay = 7 + this.firstDayOfWeek - this.firstWeekOfYearDay
    const date = new Date(Date.UTC(year, 0, firstWeekDay))

    return -((7 + date.getUTCDay() - this.firstDayOfWeek) % 7) + firstWeekDay - 1
  }

  #weeksInYear(year: number): number {
    return (
      this.#daysInYear(year) -
      this.#firstWeekOffset(year) +
      this.#firstWeekOffset(year + 1)
    ) / 7
  }
}
