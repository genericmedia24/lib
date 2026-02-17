import 'swiped-events'
import type { Delegate } from '../delegator/index.js'
import { escapeTrap, TabTrap } from '../trap/index.js'
import { Calculator } from './calculator.js'
import { formatters } from './formatters.js'
import locales from './locales.json'
import style from './style.css'
import template from './template.html'

declare global {
  interface MouseEvent {
    target: HTMLElement
  }
}

export type DateTimeDayNumbers = Array<Array<{
  date: Date
  isThisMonth: boolean
  isToday: boolean
  isWithinBounds: boolean
}>>

export interface DateTimeLocale {
  clearLabel: string
  clearText: string
  contentLabelDate: string
  contentLabelDateTime: string
  contentLabelTime: string
  contentPlaceholderDate: string
  contentPlaceholderDateTime: string
  contentPlaceholderTime: string
  dateBackLabel: string
  dateForwardLabel: string
  dayPartLabel: string
  errorRangeOverflow: string
  errorRangeUnderflow: string
  errorValueMissing: string
  hourLabel: string
  minuteLabel: string
  monthLabel: string
  nowLabel: string
  nowText: string
  okLabel: string
  okText: string
  timeBackLabel: string
  timeForwardLabel: string
  todayLabel: string
  todayText: string
  week: string
  yearLabel: string
}

export class DateTime implements Delegate {
  static attributeNames = {
    contentAs: 'data-content-as',
    controlAs: 'data-control-as',
    expanded: 'data-expanded',
    max: 'data-max',
    min: 'data-min',
    showWeeks: 'data-show-weeks',
    type: 'data-type',
  }

  static defaultContentAs?: string

  static defaultInputAs?: string

  static defaultType = 'datetime'

  static formatters = formatters

  static locales: Record<string, DateTimeLocale | undefined> = locales

  static name = 'datetime'

  static style: string = style

  static template: string = template

  attributeNames = DateTime.attributeNames

  contentElement?: HTMLButtonElement

  controlDate?: Date

  controlElement?: HTMLInputElement

  dialogDate!: Date

  dialogElement?: HTMLDialogElement

  element!: HTMLElement

  get contentAs(): string {
    return (
      this.element.getAttribute(this.attributeNames.contentAs) ??
      DateTime.defaultContentAs ??
      `locale-${this.type}`
    )
  }

  set contentAs(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.contentAs)
    } else {
      this.element.setAttribute(this.attributeNames.contentAs, value)
    }
  }

  get controlAs(): string {
    return (
      this.element.getAttribute(this.attributeNames.controlAs) ??
      DateTime.defaultInputAs ??
      `iso-${this.type}`
    )
  }

  set controlAs(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.controlAs)
    } else {
      this.element.setAttribute(this.attributeNames.controlAs, value)
    }
  }

  get isDisabled(): boolean {
    return this.contentElement?.hasAttribute('disabled') ?? false
  }

  set isDisabled(value: boolean) {
    if (value) {
      this.contentElement?.setAttribute('aria-disabled', 'true')
      this.contentElement?.toggleAttribute('disabled', true)
    } else {
      this.contentElement?.removeAttribute('aria-disabled')
      this.contentElement?.toggleAttribute('disabled', false)
    }
  }

  get isExpanded(): boolean {
    return this.contentElement?.getAttribute('aria-expanded') === 'true'
  }

  set isExpanded(value: boolean) {
    if (value) {
      this.element.toggleAttribute(this.attributeNames.expanded, true)
      this.contentElement?.setAttribute('aria-expanded', 'true')
    } else {
      this.element.toggleAttribute(this.attributeNames.expanded, false)
      this.contentElement?.setAttribute('aria-expanded', 'false')
    }
  }

  get language(): string {
    return (
      this.element.getAttribute('lang') ??
      document.documentElement.getAttribute('lang') ??
      navigator.language
    )
  }

  set language(value: null | string) {
    if (value === null) {
      this.element.removeAttribute('lang')
    } else {
      this.element.setAttribute('lang', value)
    }
  }

  get locale(): DateTimeLocale {
    const language = this.language.toLowerCase()

    return (
      DateTime.locales[language] ??
      DateTime.locales[language.split('-').shift() ?? ''] ??
      DateTime.locales.en ??
      {} as DateTimeLocale
    )
  }

  get max(): null | string {
    return this.element.getAttribute(this.attributeNames.max)
  }

  set max(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.max)
    } else {
      this.element.setAttribute(this.attributeNames.max, value)
    }
  }

  get min(): null | string {
    return this.element.getAttribute(this.attributeNames.min)
  }

  set min(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.min)
    } else {
      this.element.setAttribute(this.attributeNames.min, value)
    }
  }

  get shouldShowWeeks(): boolean {
    return this.element.hasAttribute(this.attributeNames.showWeeks)
  }

  set shouldShowWeeks(value: boolean) {
    this.element.toggleAttribute(this.attributeNames.showWeeks, value)
  }

  get type(): string {
    return (
      this.element.getAttribute(this.attributeNames.type) ??
      DateTime.defaultType
    )
  }

  set type(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.type)
    } else {
      this.element.setAttribute(this.attributeNames.type, value)
    }
  }

  get value(): null | string {
    return this.controlDate === undefined
      ? null
      : this.formatDate(this.controlAs, this.controlDate)
  }

  set value(value: null | string) {
    const date = value === null
      ? undefined
      : new Date(value)

    this.setDate(date)
  }

  #clearButtonElement?: HTMLButtonElement

  #dateBackButtonElement?: HTMLButtonElement

  #dateForwardButtonElement?: HTMLButtonElement

  #dayPartSelectElement?: HTMLSelectElement

  #handleClearClickBound = this.#handleClearClick.bind(this)

  #handleContentClickBound = this.#handleContentClick.bind(this)

  #handleContentKeydownBound = this.#handleContentKeydown.bind(this)

  #handleControlChangeBound = this.#handleControlChange.bind(this)

  #handleControlFocusBound = this.#handleControlFocus.bind(this)

  #handleDateBackClickBound = this.#handleDateBackClick.bind(this)

  #handleDateForwardClickBound = this.#handleDateForwardClick.bind(this)

  #handleDayPartChangeBound = this.#handleDayPartChange.bind(this)

  #handleDialogClickBound = this.#handleDialogClick.bind(this)

  #handleEscapeBound = this.#handleEscape.bind(this)

  #handleHourChangeBound = this.#handleHourChange.bind(this)

  #handleMinuteChangeBound = this.#handleMinuteChange.bind(this)

  #handleMonthChangeBound = this.#handleMonthChange.bind(this)

  #handleMutationBound = this.#handleMutation.bind(this)

  #handleNowClickBound = this.#handleNowClick.bind(this)

  #handleOkClickBound = this.#handleOkClick.bind(this)

  #handleTableBodyClickBound = this.#handleTableBodyClick.bind(this)

  #handleTableBodyKeydownBound = this.#handleTableBodyKeydown.bind(this)

  #handleTableBodyWheelBound = this.#handleTableBodyWheel.bind(this)

  #handleTimeBackClickBound = this.#handleTimeBackClick.bind(this)

  #handleTimeForwardClickBound = this.#handleTimeForwardClick.bind(this)

  #handleTodayClickBound = this.#handleTodayClick.bind(this)

  #handleWindowClickBound = this.#handleWindowClick.bind(this)

  #handleWindowSwipedBound = this.#handleWindowSwiped.bind(this)

  #handleYearInputBound = this.#handleYearInput.bind(this)

  #hourSelectElement?: HTMLSelectElement

  #minuteSelectElement?: HTMLSelectElement

  #monthSelectElement?: HTMLSelectElement

  #mutationObserver?: MutationObserver

  #nowButtonElement?: HTMLButtonElement

  #okButtonElement?: HTMLButtonElement

  #tableBodyElement?: HTMLTableSectionElement

  #tableHeadElement?: HTMLTableSectionElement

  #tabTrap?: TabTrap

  #timeBackButtonElement?: HTMLButtonElement

  #timeForwardButtonElement?: HTMLButtonElement

  #todayButtonElement?: HTMLButtonElement

  #yearInputElement?: HTMLInputElement

  get #calculator(): Calculator {
    return new Calculator(this.language)
  }

  get #hasDate(): boolean {
    return this.type.includes('date')
  }

  get #hasHour12(): boolean {
    return new Intl
      .DateTimeFormat(this.language, {
        timeStyle: 'short',
      })
      .resolvedOptions()
      .hour12 === true
  }

  get #hasTime(): boolean {
    return this.type.includes('time')
  }

  get #maxDate(): Date | undefined {
    const { max } = this

    return max === null
      ? undefined
      : new Date(max)
  }

  get #minDate(): Date | undefined {
    const { min } = this

    return min === null
      ? undefined
      : new Date(min)
  }

  get #typeWithCaps(): 'Date' | 'DateTime' | 'Time' {
    return this.#hasDate
      ? this.#hasTime
        ? 'DateTime'
        : 'Date'
      : 'Time'
  }

  close(): void {
    this.contentElement?.focus()
    escapeTrap.delete(this.#handleEscapeBound)
    this.dialogElement?.close()
    this.isExpanded = false
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.setDialogDate()
    this.#connectElements()
    this.#connectMutationObserver()
    this.#connectTabTrap()
    this.#connectEventListeners()
    this.#parseInput()
    this.#handleMutation()
  }

  disconnect(): void {
    this.#disconnectEventListeners()
    this.#disconnectTabTrap()
    this.#disconnectMutationObserver()
    this.#disconnectElements()
  }

  formatDate(formatter: string, date: Date): string {
    return DateTime.formatters[formatter](date, this)
  }

  isDateOverflow(date: Date): boolean {
    return date.valueOf() > (this.#maxDate?.valueOf() ?? Infinity)
  }

  isDateUnderflow(date: Date): boolean {
    return date.valueOf() < (this.#minDate?.valueOf() ?? -Infinity)
  }

  isDateValid(date: Date): boolean {
    return !Number.isNaN(date.valueOf())
  }

  isDateWithinBounds(date: Date): boolean {
    return (
      !this.isDateOverflow(date) &&
      !this.isDateUnderflow(date)
    )
  }

  moveDialogDateByDay(delta: number): void {
    this.dialogDate.setDate(this.dialogDate.getDate() + delta)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogDateByMonth(delta: number): void {
    const calendarDay = this.dialogDate.getDate()
    const date = new Date(this.dialogDate)

    if (delta > 0) {
      date.setDate(1)
      date.setMonth(date.getMonth() + delta + 1)
      date.setDate(0)
    } else {
      date.setDate(0)
    }

    if (calendarDay > date.getDate()) {
      this.dialogDate = date
    } else {
      this.dialogDate.setMonth(this.dialogDate.getMonth() + delta)
    }

    this.#updateDate()
    this.#updateTime()
  }

  moveDialogDateByYear(delta: number): void {
    this.dialogDate.setFullYear(this.dialogDate.getFullYear() + delta)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogDateToDay(day: number): void {
    this.dialogDate.setDate(day)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogDateToMonth(month: number): void {
    this.dialogDate.setMonth(month)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogDateToYear(year: number): void {
    this.dialogDate.setFullYear(year)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogTimeByHour(delta: number): void {
    this.dialogDate.setHours(this.dialogDate.getHours() + delta)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogTimeByMinute(delta: number): void {
    this.dialogDate.setMinutes(this.dialogDate.getMinutes() + delta)
    this.#updateDate()
    this.#updateTime()
  }

  moveDialogTimeToDayPart(dayPart: string): void {
    if (dayPart === 'AM') {
      this.dialogDate.setHours(this.dialogDate.getHours() - 12)
    } else if (dayPart === 'PM') {
      this.dialogDate.setHours(this.dialogDate.getHours() + 12)
    }

    this.#updateDate()
    this.#updateTime()
  }

  moveDialogTimeToHour(hour: number): void {
    const currentDayPart = this.dialogDate
      .toLocaleTimeString()
      .slice(-2)

    if (currentDayPart === 'AM') {
      this.dialogDate.setHours(hour === 12 ? hour - 12 : hour)
    } else if (currentDayPart === 'PM') {
      this.dialogDate.setHours(hour === 12 ? hour : hour + 12)
    } else {
      this.dialogDate.setHours(hour)
    }

    this.#updateDate()
    this.#updateTime()
  }

  moveDialogTimeToMinute(minute: number): void {
    this.dialogDate.setMinutes(minute)
    this.#updateDate()
    this.#updateTime()
  }

  open(): void {
    this.dialogElement?.show()
    this.isExpanded = true
    escapeTrap.add(this.#handleEscapeBound)

    window.requestAnimationFrame(() => {
      this.#focusDayNumber()
    })
  }

  render(): void {
    this.#renderAria()
    this.#renderDate()
    this.#renderTime()
  }

  setDate(date?: Date): boolean {
    if (
      date === undefined ||
      !this.isDateValid(date)
    ) {
      this.dialogDate = this.#createDate()
    } else {
      this.dialogDate = date
    }

    if (
      date === undefined || (
        this.isDateValid(date) &&
        this.isDateWithinBounds(date)
      )
    ) {
      this.controlDate = date
      this.update()

      return true
    }

    this.update()

    return false
  }

  setDialogDate(date?: Date): void {
    if (
      date === undefined ||
      !this.isDateValid(date)
    ) {
      this.dialogDate = this.#createDate()
    } else {
      this.dialogDate = date
    }

    this.#updateDate()
    this.#updateTime()
  }

  setInputDate(date?: Date): boolean {
    if (
      date === undefined || (
        this.isDateValid(date) &&
        this.isDateWithinBounds(date)
      )
    ) {
      this.controlDate = date
      this.update()

      return true
    }

    return false
  }

  toggle(): void {
    if (this.isExpanded) {
      this.close()
    } else {
      this.open()
    }
  }

  update(): void {
    this.#updateDate()
    this.#updateTime()
    this.#updateInputElement()
    this.#updateContentElement()
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        delegatesFocus: true,
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${DateTime.style}</style>
        ${DateTime.template}
      `
    }

    const contentSlotElement = this.element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="content"]')

    this.contentElement =
      contentSlotElement?.assignedElements().at(0) as HTMLButtonElement | undefined ??
      contentSlotElement?.querySelector<HTMLButtonElement>('button') ??
      undefined

    const controlSlotElement = this.element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="control"]')

    this.controlElement =
      controlSlotElement?.assignedElements().at(0) as HTMLInputElement | undefined ??
      controlSlotElement?.querySelector<HTMLInputElement>('input') ??
      undefined

    this.dialogElement = this.element.shadowRoot?.querySelector<HTMLDialogElement>('dialog[part~="dialog"]') ?? undefined
    this.#clearButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="clear"]') ?? undefined
    this.#dateBackButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="date"][part~="back"]') ?? undefined
    this.#dateForwardButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="date"][part~="forward"]') ?? undefined
    this.#dayPartSelectElement = this.element.shadowRoot?.querySelector<HTMLSelectElement>('select[part~="day-part"]') ?? undefined
    this.#hourSelectElement = this.element.shadowRoot?.querySelector<HTMLSelectElement>('select[part~="hour"]') ?? undefined
    this.#minuteSelectElement = this.element.shadowRoot?.querySelector<HTMLSelectElement>('select[part~="minute"]') ?? undefined
    this.#monthSelectElement = this.element.shadowRoot?.querySelector<HTMLSelectElement>('select[part~="month"]') ?? undefined
    this.#nowButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="now"]') ?? undefined
    this.#okButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="ok"]') ?? undefined
    this.#tableBodyElement = this.element.shadowRoot?.querySelector<HTMLTableSectionElement>('tbody[part~="tbody"]') ?? undefined
    this.#tableHeadElement = this.element.shadowRoot?.querySelector<HTMLTableSectionElement>('thead[part~="thead"]') ?? undefined
    this.#timeBackButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="time"][part~="back"]') ?? undefined
    this.#timeForwardButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="time"][part~="forward"]') ?? undefined
    this.#todayButtonElement = this.element.shadowRoot?.querySelector<HTMLButtonElement>('button[part~="today"]') ?? undefined
    this.#yearInputElement = this.element.shadowRoot?.querySelector<HTMLInputElement>('input[part~="year"]') ?? undefined
  }

  #connectEventListeners(): void {
    this.contentElement?.addEventListener('click', this.#handleContentClickBound)
    this.contentElement?.addEventListener('keydown', this.#handleContentKeydownBound)
    this.controlElement?.addEventListener('change', this.#handleControlChangeBound)
    this.controlElement?.addEventListener('focus', this.#handleControlFocusBound)
    this.dialogElement?.addEventListener('click', this.#handleDialogClickBound)
    this.#clearButtonElement?.addEventListener('click', this.#handleClearClickBound)
    this.#dateBackButtonElement?.addEventListener('click', this.#handleDateBackClickBound)
    this.#dateForwardButtonElement?.addEventListener('click', this.#handleDateForwardClickBound)
    this.#dayPartSelectElement?.addEventListener('change', this.#handleDayPartChangeBound)
    this.#hourSelectElement?.addEventListener('change', this.#handleHourChangeBound)
    this.#minuteSelectElement?.addEventListener('change', this.#handleMinuteChangeBound)
    this.#monthSelectElement?.addEventListener('change', this.#handleMonthChangeBound)
    this.#nowButtonElement?.addEventListener('click', this.#handleNowClickBound)
    this.#okButtonElement?.addEventListener('click', this.#handleOkClickBound)
    this.#tableBodyElement?.addEventListener('click', this.#handleTableBodyClickBound)
    this.#tableBodyElement?.addEventListener('keydown', this.#handleTableBodyKeydownBound)
    this.#tableBodyElement?.addEventListener('wheel', this.#handleTableBodyWheelBound)
    this.#timeBackButtonElement?.addEventListener('click', this.#handleTimeBackClickBound)
    this.#timeForwardButtonElement?.addEventListener('click', this.#handleTimeForwardClickBound)
    this.#todayButtonElement?.addEventListener('click', this.#handleTodayClickBound)
    this.#yearInputElement?.addEventListener('input', this.#handleYearInputBound)
    window.addEventListener('click', this.#handleWindowClickBound)
    window.addEventListener('swiped', this.#handleWindowSwipedBound)
  }

  #connectMutationObserver(): void {
    this.#mutationObserver = new MutationObserver(this.#handleMutationBound)

    this.#mutationObserver.observe(this.element, {
      attributeFilter: Object.values(this.attributeNames),
      attributes: true,
    })
  }

  #connectTabTrap(): void {
    if (this.dialogElement !== undefined) {
      this.#tabTrap = new TabTrap(this.dialogElement)

      this.#tabTrap.add(
        this.#monthSelectElement,
        this.#yearInputElement,
        this.#dateBackButtonElement,
        this.#dateForwardButtonElement,
        this.#hourSelectElement,
        this.#minuteSelectElement,
        this.#dayPartSelectElement,
        this.#clearButtonElement,
        this.#todayButtonElement,
        this.#nowButtonElement,
        this.#okButtonElement,
      )

      this.#tabTrap.observe()
    }
  }

  #createDate(): Date {
    const date = new Date()

    date.setSeconds(0)
    date.setMilliseconds(0)

    if (this.type === 'date') {
      date.setHours(0)
      date.setMinutes(0)
    }

    return date
  }

  #createDayNames(): string[] {
    const names = []

    const formatter = new Intl.DateTimeFormat(this.language, {
      weekday: 'long',
    })

    const { firstDayOfWeek } = this.#calculator

    for (let i = firstDayOfWeek; i < (7 + firstDayOfWeek); i += 1) {
      names.push(formatter.format(new Date(2021, 7, 1 + i)))
    }

    return names
  }

  #createDayNumbers(): DateTimeDayNumbers {
    const numbers: DateTimeDayNumbers = []
    const monthDate = new Date(this.dialogDate.getFullYear(), this.dialogDate.getMonth(), 1)
    const offsetDays = ((monthDate.getDay() - this.#calculator.firstDayOfWeek + 7) % 7)
    const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 - offsetDays)
    const currentDate = new Date(startDate)
    const now = new Date()

    for (let i = 0; i < 6; i += 1) {
      const week = []

      for (let j = 0; j < 7; j += 1) {
        week.push({
          date: new Date(currentDate),
          isThisMonth: currentDate.getMonth() === this.dialogDate.getMonth(),
          isToday: currentDate.toDateString() === now.toDateString(),
          isWithinBounds: this.isDateWithinBounds(currentDate),
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      numbers.push(week)
    }

    return numbers
  }

  #createMonthNames(): string[] {
    const names = []

    const formatter = new Intl.DateTimeFormat(this.language, {
      month: 'long',
    })

    for (let i = 0; i < 12; i += 1) {
      const name = formatter.format(new Date(0, i, 1))

      names.push(name.slice(0, 1).toUpperCase() + name.slice(1))
    }

    return names
  }

  #disconnectElements(): void {
    this.contentElement = undefined
    this.controlElement = undefined
    this.dialogElement = undefined
    this.#clearButtonElement = undefined
    this.#dateBackButtonElement = undefined
    this.#dateForwardButtonElement = undefined
    this.#dayPartSelectElement = undefined
    this.#hourSelectElement = undefined
    this.#minuteSelectElement = undefined
    this.#monthSelectElement = undefined
    this.#nowButtonElement = undefined
    this.#okButtonElement = undefined
    this.#tableBodyElement = undefined
    this.#tableHeadElement = undefined
    this.#timeBackButtonElement = undefined
    this.#timeForwardButtonElement = undefined
    this.#todayButtonElement = undefined
    this.#yearInputElement = undefined
  }

  #disconnectEventListeners(): void {
    this.contentElement?.removeEventListener('click', this.#handleContentClickBound)
    this.contentElement?.removeEventListener('keydown', this.#handleContentKeydownBound)
    this.controlElement?.removeEventListener('change', this.#handleControlChangeBound)
    this.controlElement?.removeEventListener('focus', this.#handleControlFocusBound)
    this.dialogElement?.removeEventListener('click', this.#handleDialogClickBound)
    this.#clearButtonElement?.removeEventListener('click', this.#handleClearClickBound)
    this.#dateBackButtonElement?.removeEventListener('click', this.#handleDateBackClickBound)
    this.#dateForwardButtonElement?.removeEventListener('click', this.#handleDateForwardClickBound)
    this.#dayPartSelectElement?.removeEventListener('change', this.#handleDayPartChangeBound)
    this.#hourSelectElement?.removeEventListener('change', this.#handleHourChangeBound)
    this.#minuteSelectElement?.removeEventListener('change', this.#handleMinuteChangeBound)
    this.#monthSelectElement?.removeEventListener('change', this.#handleMonthChangeBound)
    this.#nowButtonElement?.removeEventListener('click', this.#handleNowClickBound)
    this.#okButtonElement?.removeEventListener('click', this.#handleOkClickBound)
    this.#tableBodyElement?.removeEventListener('click', this.#handleTableBodyClickBound)
    this.#tableBodyElement?.removeEventListener('keydown', this.#handleTableBodyKeydownBound)
    this.#tableBodyElement?.removeEventListener('wheel', this.#handleTableBodyWheelBound)
    this.#timeBackButtonElement?.removeEventListener('click', this.#handleTimeBackClickBound)
    this.#timeForwardButtonElement?.removeEventListener('click', this.#handleTimeForwardClickBound)
    this.#todayButtonElement?.removeEventListener('click', this.#handleTodayClickBound)
    this.#yearInputElement?.removeEventListener('input', this.#handleYearInputBound)
    window.removeEventListener('click', this.#handleWindowClickBound)
    window.removeEventListener('swiped', this.#handleWindowSwipedBound)
  }

  #disconnectMutationObserver(): void {
    this.#mutationObserver?.disconnect()
  }

  #disconnectTabTrap(): void {
    this.#tabTrap?.disconnect()
    this.#tabTrap = undefined
  }

  #focusDayNumber(): void {
    this.#tableBodyElement
      ?.querySelector<HTMLElement>('[tabindex="0"]')
      ?.focus()
  }

  #handleClearClick(event: MouseEvent): void {
    event.preventDefault()
    this.setDate()
    this.close()
  }

  #handleContentClick(event: MouseEvent): void {
    event.stopPropagation()
    this.toggle()
  }

  #handleContentKeydown(event: KeyboardEvent): void {
    if (
      event.code === 'Space' ||
      event.code === 'Enter'
    ) {
      this.open()
    }
  }

  #handleControlChange(): void {
    this.#parseInput()
    this.#updateDate()
    this.#updateTime()
  }

  #handleControlFocus(): void {
    this.contentElement?.focus()
  }

  #handleDateBackClick(event: MouseEvent): void {
    event.preventDefault()

    if (event.shiftKey) {
      this.moveDialogDateByYear(-1)
    } else {
      this.moveDialogDateByMonth(-1)
    }
  }

  #handleDateForwardClick(event: MouseEvent): void {
    event.preventDefault()

    if (event.shiftKey) {
      this.moveDialogDateByYear(1)
    } else {
      this.moveDialogDateByMonth(1)
    }
  }

  #handleDayPartChange(): void {
    this.moveDialogTimeToDayPart(this.#dayPartSelectElement?.value ?? 'AM')
  }

  #handleDialogClick(event: MouseEvent): void {
    event.stopPropagation()
  }

  #handleEscape(): void {
    this.close()
  }

  #handleHourChange(): void {
    this.moveDialogTimeToHour(Number(this.#hourSelectElement?.value ?? 0))
  }

  #handleMinuteChange(): void {
    this.moveDialogTimeToMinute(Number(this.#minuteSelectElement?.value ?? 0))
  }

  #handleMonthChange(): void {
    this.moveDialogDateToMonth(Number(this.#monthSelectElement?.value ?? 0))
  }

  #handleMutation(): void {
    this.render()
    this.update()
  }

  #handleNowClick(event: MouseEvent): void {
    event.preventDefault()
    this.dialogDate = this.#createDate()
    this.setInputDate(new Date(this.dialogDate))
    this.#focusDayNumber()
  }

  #handleOkClick(event: MouseEvent): void {
    event.preventDefault()
    this.setInputDate(new Date(this.dialogDate))
    this.close()
  }

  #handleTableBodyClick(event: MouseEvent): void {
    const dayNumberElement = event.target.closest<HTMLTableCellElement>('td[part~="cell"][part~="day-number"]')

    if (dayNumberElement !== null) {
      const cellIndex = Array
        .from(dayNumberElement.parentElement?.childNodes ?? [])
        .indexOf(dayNumberElement) - (this.shouldShowWeeks ? 1 : 0)

      const rowIndex = Array
        .from(dayNumberElement.parentElement?.parentElement?.childNodes ?? [])
        .indexOf(dayNumberElement.parentElement ?? dayNumberElement)

      const numbers = this.#createDayNumbers()

      this.dialogDate.setDate(numbers[rowIndex][cellIndex].date.getDate())
      this.dialogDate.setMonth(numbers[rowIndex][cellIndex].date.getMonth())
      this.dialogDate.setFullYear(numbers[rowIndex][cellIndex].date.getFullYear())

      const isSet = this.setInputDate(new Date(this.dialogDate))

      if (isSet) {
        if (this.#hasTime) {
          this.#focusDayNumber()
        } else {
          this.close()
        }
      }
    }
  }

  #handleTableBodyKeydown(event: KeyboardEvent): void {
    if (event.code === 'Enter') {
      event.preventDefault()

      const isSet = this.setInputDate(new Date(this.dialogDate))

      if (isSet) {
        this.close()
      }
    } else if (event.code === 'Space') {
      event.preventDefault()
      this.setInputDate(new Date(this.dialogDate))
    } else if (
      event.code === 'ArrowDown' ||
      event.code === 'ArrowLeft' ||
      event.code === 'ArrowRight' ||
      event.code === 'ArrowUp' ||
      event.code === 'End' ||
      event.code === 'Home' ||
      event.code === 'PageDown' ||
      event.code === 'PageUp'
    ) {
      event.preventDefault()

      switch (event.code) {
        case 'ArrowDown':
          this.moveDialogDateByDay(7)
          break
        case 'ArrowLeft':
          if (document.dir === 'rtl') {
            this.moveDialogDateByDay(1)
          } else {
            this.moveDialogDateByDay(-1)
          }

          break
        case 'ArrowRight':
          if (document.dir === 'rtl') {
            this.moveDialogDateByDay(-1)
          } else {
            this.moveDialogDateByDay(1)
          }

          break
        case 'ArrowUp':
          this.moveDialogDateByDay(-7)
          break
        case 'End':
          this.moveDialogDateByDay((6 - ((this.dialogDate.getDay() - this.#calculator.firstDayOfWeek + 7) % 7)))
          break
        case 'Home':
          this.moveDialogDateByDay(-1 * ((this.dialogDate.getDay() - this.#calculator.firstDayOfWeek + 7) % 7))
          break
        case 'PageDown':
          if (event.shiftKey) {
            this.moveDialogDateByYear(1)
          } else {
            this.moveDialogDateByMonth(1)
          }

          break
        case 'PageUp':
          if (event.shiftKey) {
            this.moveDialogDateByYear(-1)
          } else {
            this.moveDialogDateByMonth(-1)
          }

          break
        default:
          break
      }

      this.#focusDayNumber()
    }
  }

  #handleTableBodyWheel(event: WheelEvent): void {
    if (
      event.deltaY < -1 &&
      event.deltaX === 0
    ) {
      event.preventDefault()

      if (event.shiftKey) {
        this.moveDialogDateByYear(-1)
      } else {
        this.moveDialogDateByMonth(-1)
      }
    } else if (
      event.deltaY > 1 &&
      event.deltaX === 0
    ) {
      event.preventDefault()

      if (event.shiftKey) {
        this.moveDialogDateByYear(1)
      } else {
        this.moveDialogDateByMonth(1)
      }
    }
  }

  #handleTimeBackClick(event: MouseEvent): void {
    event.preventDefault()

    if (event.shiftKey) {
      this.moveDialogTimeByHour(-1)
    } else {
      this.moveDialogTimeByMinute(-1)
    }
  }

  #handleTimeForwardClick(event: MouseEvent): void {
    event.preventDefault()

    if (event.shiftKey) {
      this.moveDialogTimeByHour(1)
    } else {
      this.moveDialogTimeByMinute(1)
    }
  }

  #handleTodayClick(event: MouseEvent): void {
    event.preventDefault()
    this.dialogDate = this.#createDate()
    this.setInputDate(new Date(this.dialogDate))
    this.#focusDayNumber()
  }

  #handleWindowClick(event: MouseEvent): void {
    if (
      !this.element.contains(event.target) &&
      this.dialogElement?.contains(event.target) === false
    ) {
      this.close()
    }
  }

  #handleWindowSwiped(event: Event): void {
    const {
      detail,
      target,
    } = event as CustomEvent<{ dir: string }>

    if (
      target instanceof HTMLElement &&
      this.element.contains(target)
    ) {
      if (detail.dir === 'left') {
        if (document.dir === 'rtl') {
          this.moveDialogDateByMonth(-1)
        } else {
          this.moveDialogDateByMonth(1)
        }
      } else if (detail.dir === 'right') {
        if (document.dir === 'rtl') {
          this.moveDialogDateByMonth(1)
        } else {
          this.moveDialogDateByMonth(-1)
        }
      }
    }
  }

  #handleYearInput(): void {
    if (this.#yearInputElement?.value.length === 4) {
      this.moveDialogDateToYear(Number(this.#yearInputElement.value))
    }
  }

  #parseInput(): void {
    if (this.controlElement !== undefined) {
      if (this.controlElement.value.length > 0) {
        const date = this.type === 'time'
          ? new Date(`${new Date().toISOString().slice(0, 10)}T${this.controlElement.value}`)
          : new Date(this.controlElement.value)

        if (!Number.isNaN(date.valueOf())) {
          this.controlDate = date
          this.dialogDate = new Date(this.controlDate)
        }
      }
    }
  }

  #renderAria(): void {
    const { locale } = this

    this.contentElement?.setAttribute('aria-autocomplete', 'none')
    this.contentElement?.setAttribute('aria-expanded', 'false')
    this.contentElement?.setAttribute('aria-haspopup', 'dialog')
    this.contentElement?.setAttribute('aria-label', locale[`contentLabel${this.#typeWithCaps}`])
    this.contentElement?.setAttribute('role', 'combobox')
    this.contentElement?.setHTMLUnsafe(locale[`contentPlaceholder${this.#typeWithCaps}`])
    this.controlElement?.setAttribute('aria-hidden', 'true')
    this.controlElement?.setAttribute('tabindex', '-1')
    this.#clearButtonElement?.setAttribute('aria-label', locale.clearLabel)
    this.#clearButtonElement?.setHTMLUnsafe(locale.clearText)
    this.#dateBackButtonElement?.setAttribute('aria-label', locale.dateBackLabel)
    this.#dateForwardButtonElement?.setAttribute('aria-label', locale.dateForwardLabel)
    this.#dayPartSelectElement?.setAttribute('aria-label', locale.dayPartLabel)
    this.#hourSelectElement?.setAttribute('aria-label', locale.hourLabel)
    this.#minuteSelectElement?.setAttribute('aria-label', locale.minuteLabel)
    this.#monthSelectElement?.setAttribute('aria-label', locale.monthLabel)
    this.#nowButtonElement?.setAttribute('aria-label', locale.nowLabel)
    this.#nowButtonElement?.setHTMLUnsafe(locale.nowText)
    this.#okButtonElement?.setAttribute('aria-label', locale.okLabel)
    this.#okButtonElement?.setHTMLUnsafe(locale.okText)
    this.#timeBackButtonElement?.setAttribute('aria-label', locale.timeBackLabel)
    this.#timeForwardButtonElement?.setAttribute('aria-label', locale.timeForwardLabel)
    this.#todayButtonElement?.setAttribute('aria-label', locale.todayLabel)
    this.#todayButtonElement?.setHTMLUnsafe(locale.todayText)
    this.#yearInputElement?.setAttribute('aria-label', locale.yearLabel)
  }

  #renderDate(): void {
    this.#renderDateMonthSelectElement()
    this.#renderDateTableHeadElement()
    this.#renderDateTableBodyElement()
  }

  #renderDateMonthSelectElement(): void {
    this.#monthSelectElement?.setHTMLUnsafe('')

    const names = this.#createMonthNames()

    for (let i = 0; i < names.length; i += 1) {
      const optionElement = document.createElement('option')

      optionElement.part.add('option', 'month')
      optionElement.setAttribute('value', i.toString())
      optionElement.textContent = names[i]
      this.#monthSelectElement?.appendChild(optionElement)
    }
  }

  #renderDateTableBodyElement(): void {
    this.#tableBodyElement?.setHTMLUnsafe('')

    const numbers = this.#createDayNumbers()

    for (const week of numbers) {
      const rowElement = document.createElement('tr')

      rowElement.part.add('row', 'day-number')
      this.#tableBodyElement?.appendChild(rowElement)

      if (this.shouldShowWeeks) {
        const weekNumberElement = document.createElement('td')

        weekNumberElement.part.add('cell', 'week-number')
        weekNumberElement.setAttribute('tabindex', '-1')
        rowElement.appendChild(weekNumberElement)

        const shortWeekNumberElement = document.createElement('span')

        shortWeekNumberElement.part.add('value', 'week-number', 'short')
        shortWeekNumberElement.setAttribute('aria-hidden', 'true')
        weekNumberElement.appendChild(shortWeekNumberElement)

        const fullWeekNumberElement = document.createElement('span')

        fullWeekNumberElement.part.add('value', 'week-number', 'full')
        weekNumberElement.appendChild(fullWeekNumberElement)
      }

      for (let i = 0; i < week.length; i += 1) {
        const dayNumberElement = document.createElement('td')

        dayNumberElement.part.add('cell', 'day-number')
        dayNumberElement.setAttribute('tabindex', '-1')
        rowElement.appendChild(dayNumberElement)

        const shortDayNumberElement = document.createElement('span')

        shortDayNumberElement.part.add('value', 'day-number', 'short')
        shortDayNumberElement.setAttribute('aria-hidden', 'true')
        dayNumberElement.appendChild(shortDayNumberElement)

        const fullDayNumberElement = document.createElement('span')

        fullDayNumberElement.part.add('value', 'day-number', 'full')
        dayNumberElement.appendChild(fullDayNumberElement)
      }
    }
  }

  #renderDateTableHeadElement(): void {
    this.#tableHeadElement?.setHTMLUnsafe('')

    const rowElement = document.createElement('tr')

    rowElement.part.add('row', 'day-name')
    this.#tableHeadElement?.appendChild(rowElement)

    if (this.shouldShowWeeks) {
      const weekNumberElement = document.createElement('th')

      weekNumberElement.part.add('cell', 'week-number')
      rowElement.appendChild(weekNumberElement)
    }

    const names = this.#createDayNames()

    for (const name of names) {
      const dayNameElement = document.createElement('th')

      dayNameElement.part.add('cell', 'day-name')

      const shortDayNameElement = document.createElement('span')

      shortDayNameElement.part.add('value', 'day-name', 'short')
      shortDayNameElement.setAttribute('aria-hidden', 'true')
      shortDayNameElement.textContent = name.slice(0, 1)
      dayNameElement.appendChild(shortDayNameElement)

      const fullDayNameElement = document.createElement('span')

      fullDayNameElement.part.add('value', 'day-name', 'full')
      fullDayNameElement.textContent = name
      dayNameElement.appendChild(fullDayNameElement)
      rowElement.appendChild(dayNameElement)
    }
  }

  #renderTime(): void {
    this.#renderTimeHourSelectElement()
    this.#renderTimeMinuteSelectElement()
    this.#renderTimeDayPartSelectElement()
  }

  #renderTimeDayPartSelectElement(): void {
    this.#dayPartSelectElement?.setHTMLUnsafe('')

    if (this.#hasHour12) {
      for (const part of [
        'AM',
        'PM',
      ]) {
        const optionElement = document.createElement('option')

        optionElement.part.add('option', 'day-part')
        optionElement.textContent = part
        this.#dayPartSelectElement?.appendChild(optionElement)
      }
    } else {
      this.#dayPartSelectElement?.remove()
      this.#dayPartSelectElement = undefined
    }
  }

  #renderTimeHourSelectElement(): void {
    this.#hourSelectElement?.setHTMLUnsafe('')

    const hours = this.#hasHour12
      ? new Array(12).fill(0).map((_, index) => index + 1)
      : new Array(24).fill(0).map((_, index) => index)

    for (const hour of hours) {
      const optionElement = document.createElement('option')

      optionElement.part.add('option', 'hour')
      optionElement.setAttribute('value', hour.toString())

      optionElement.textContent = hour
        .toString()
        .padStart(2, '0')

      this.#hourSelectElement?.appendChild(optionElement)
    }
  }

  #renderTimeMinuteSelectElement(): void {
    this.#minuteSelectElement?.setHTMLUnsafe('')

    for (let i = 0; i < 60; i += 1) {
      const optionElement = document.createElement('option')

      optionElement.part.add('option', 'minute')
      optionElement.setAttribute('value', i.toString())

      optionElement.textContent = i
        .toString()
        .padStart(2, '0')

      this.#minuteSelectElement?.appendChild(optionElement)
    }
  }

  #updateContentElement(): void {
    if (this.contentElement !== undefined) {
      const { locale } = this

      const value = this.controlDate === undefined
        ? undefined
        : this.formatDate(this.contentAs, this.controlDate)

      if (value === undefined) {
        this.contentElement.setAttribute('aria-label', locale[`contentLabel${this.#typeWithCaps}`])
        this.contentElement.textContent = locale[`contentPlaceholder${this.#typeWithCaps}`]
      } else {
        this.contentElement.setAttribute('aria-label', `${value}, ${locale[`contentLabel${this.#typeWithCaps}`]}`)
        this.contentElement.textContent = value
      }
    }
  }

  #updateDate(): void {
    this.#updateDateTableBodyElement()
    this.#updateDateMonthSelectElement()
    this.#updateDateYearInputElement()
  }

  #updateDateMonthSelectElement(): void {
    if (this.#monthSelectElement !== undefined) {
      this.#monthSelectElement.value = this.dialogDate
        .getMonth()
        .toString()
    }
  }

  #updateDateTableBodyElement(): void {
    const numbers = this.#createDayNumbers()
    const calculator = this.#calculator

    const formatter = new Intl.DateTimeFormat(this.language, {
      dateStyle: 'long',
    })

    for (let i = 0; i < numbers.length; i += 1) {
      if (this.shouldShowWeeks) {
        const weekNumberElement = this.#tableBodyElement
          ?.childNodes
          .item(i)
          .childNodes
          .item(0)

        if (weekNumberElement instanceof HTMLTableCellElement) {
          const weekNumber = calculator.getWeekNumber(numbers[i][0].date)

          if (weekNumberElement.firstElementChild instanceof HTMLElement) {
            weekNumberElement.firstElementChild.textContent = weekNumber.toString()
          }

          if (weekNumberElement.lastElementChild instanceof HTMLElement) {
            weekNumberElement.lastElementChild.textContent = `${this.locale.week} ${weekNumber}`
          }
        }
      }

      for (let j = 0, number; j < numbers[i].length; j += 1) {
        number = numbers[i][j]

        const dayNumberElement = this.#tableBodyElement
          ?.childNodes
          .item(i)
          .childNodes
          .item(j + (this.shouldShowWeeks ? 1 : 0))

        if (dayNumberElement instanceof HTMLTableCellElement) {
          if (dayNumberElement.firstElementChild instanceof HTMLElement) {
            dayNumberElement.firstElementChild.textContent = number.date
              .getDate()
              .toString()
          }

          if (dayNumberElement.lastElementChild instanceof HTMLElement) {
            dayNumberElement.lastElementChild.textContent = formatter.format(number.date)
          }

          if (number.isThisMonth) {
            dayNumberElement.part.remove('other-month')
          } else {
            dayNumberElement.part.add('other-month')
          }

          if (number.isToday) {
            dayNumberElement.part.add('today')
          } else {
            dayNumberElement.part.remove('today')
          }

          if (number.isWithinBounds) {
            dayNumberElement.part.remove('disabled')
            dayNumberElement.removeAttribute('aria-disabled')
          } else {
            dayNumberElement.part.add('disabled')
            dayNumberElement.setAttribute('aria-disabled', 'true')
          }

          if (number.date.toDateString() === this.controlDate?.toDateString()) {
            dayNumberElement.part.add('selected')
            dayNumberElement.setAttribute('aria-selected', 'true')
          } else {
            dayNumberElement.part.remove('selected')
            dayNumberElement.removeAttribute('aria-selected')
          }

          if (number.date.toDateString() === this.dialogDate.toDateString()) {
            dayNumberElement.toggleAttribute('autofocus', true)
            dayNumberElement.setAttribute('tabindex', '0')
          } else {
            dayNumberElement.toggleAttribute('autofocus', false)
            dayNumberElement.setAttribute('tabindex', '-1')
          }
        }
      }
    }
  }

  #updateDateYearInputElement(): void {
    if (this.#yearInputElement !== undefined) {
      this.#yearInputElement.value = this.dialogDate
        .getFullYear()
        .toString()
    }
  }

  #updateInputElement(): void {
    if (this.controlElement !== undefined) {
      const value = this.controlDate === undefined
        ? ''
        : this.formatDate(this.controlAs, this.controlDate)

      const hasChanged = this.controlElement.value !== value

      this.controlElement.value = value

      if (hasChanged) {
        this.controlElement.dispatchEvent(new Event('change', {
          bubbles: true,
        }))
      }
    }
  }

  #updateTime(): void {
    this.#updateTimeHourSelectElement()
    this.#updateTimeMinuteSelectElement()
    this.#updateTimeDayPartSelectElement()
  }

  #updateTimeDayPartSelectElement(): void {
    if (this.#dayPartSelectElement !== undefined) {
      const hourValue = this.dialogDate.getHours()

      if (hourValue < 12) {
        this.#dayPartSelectElement.value = 'AM'
      } else {
        this.#dayPartSelectElement.value = 'PM'
      }
    }
  }

  #updateTimeHourSelectElement(): void {
    if (this.#hourSelectElement !== undefined) {
      const hourValue = this.dialogDate.getHours()

      if (this.#hasHour12) {
        if (hourValue < 12) {
          this.#hourSelectElement.value = (hourValue === 0 ? hourValue + 12 : hourValue).toString()
        } else {
          this.#hourSelectElement.value = (hourValue > 12 ? hourValue - 12 : hourValue).toString()
        }
      } else {
        this.#hourSelectElement.value = hourValue.toString()
      }
    }
  }

  #updateTimeMinuteSelectElement(): void {
    if (this.#minuteSelectElement !== undefined) {
      this.#minuteSelectElement.value = this.dialogDate
        .getMinutes()
        .toString()
    }
  }
}
