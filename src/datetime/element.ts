import { DateTime } from './delegate.js'

export class DateTimeElement extends HTMLElement {
  static attributeNames = {
    contentAs: 'content-as',
    controlAs: 'control-as',
    expanded: 'expanded',
    max: 'max',
    min: 'min',
    showWeeks: 'show-weeks',
    type: 'type',
  }

  static formAssociated = true

  static name = 'gm-datetime'

  datetime: DateTime

  get disabled(): boolean {
    return this.datetime.isDisabled
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value)
    this.datetime.isDisabled = value
  }

  get expanded(): boolean {
    return this.datetime.isExpanded
  }

  set expanded(value: boolean) {
    this.datetime.isExpanded = value
  }

  get form(): HTMLFormElement | null {
    return this.#elementInternals.form
  }

  get max(): null | string {
    return this.datetime.max
  }

  set max(value: null | string) {
    this.datetime.max = value
  }

  get min(): null | string {
    return this.datetime.min
  }

  set min(value: null | string) {
    this.datetime.min = value
  }

  get name(): null | string {
    return this.getAttribute('name')
  }

  set name(value: null | string) {
    if (value === null) {
      this.removeAttribute('name')
    } else {
      this.setAttribute('name', value)
    }
  }

  get required(): boolean {
    return this.hasAttribute('required')
  }

  set required(value: boolean) {
    this.toggleAttribute('required', value)
  }

  get type(): string {
    return this.datetime.type
  }

  set type(value: null | string) {
    this.datetime.type = value
  }

  get validationMessage(): string {
    return this.#elementInternals.validationMessage
  }

  get validity(): ValidityState {
    return this.#elementInternals.validity
  }

  get value(): null | string {
    return this.datetime.value
  }

  set value(value: null | string) {
    this.datetime.value = value
  }

  get willValidate(): boolean {
    return this.#elementInternals.willValidate
  }

  #elementInternals: ElementInternals

  #handleControlChangeBound = this.#handleControlChange.bind(this)

  constructor() {
    super()
    this.#elementInternals = this.attachInternals()
    this.datetime = new DateTime()
    this.datetime.attributeNames = DateTimeElement.attributeNames
    this.datetime.element = this
  }

  checkValidity(): boolean {
    return this.#elementInternals.checkValidity()
  }

  connectedCallback(): void {
    this.datetime.connect(this)
    this.formResetCallback()
    this.#addEventListeners()
  }

  disconnectedCallback(): void {
    this.datetime.disconnect()
    this.#removeEventListeners()
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled
  }

  formResetCallback(): void {
    this.value = this.getAttribute('value') ?? ''
    this.#setFormValue()
  }

  formStateRestoreCallback(value: string): void {
    this.value = value
    this.#setFormValue()
  }

  reportValidity(): boolean {
    return this.#elementInternals.reportValidity()
  }

  #addEventListeners(): void {
    this.datetime.controlElement?.addEventListener('change', this.#handleControlChangeBound)
  }

  #handleControlChange(): void {
    this.#setFormValue()

    this.dispatchEvent(new Event('change', {
      bubbles: true,
    }))
  }

  #removeEventListeners(): void {
    this.datetime.controlElement?.removeEventListener('change', this.#handleControlChangeBound)
  }

  #setFormValue(): void {
    if (
      this.hasAttribute('required') &&
      this.value === ''
    ) {
      this.#elementInternals.setValidity({
        valueMissing: true,
      }, this.datetime.locale.errorValueMissing)
    } else if (
      this.datetime.controlDate !== undefined &&
      this.datetime.isDateOverflow(this.datetime.controlDate)
    ) {
      this.#elementInternals.setValidity({
        rangeOverflow: true,
      }, this.datetime.locale.errorRangeOverflow.replace('{max}', this.datetime.formatDate(this.datetime.contentAs, new Date(this.datetime.max ?? 0))))
    } else if (
      this.datetime.controlDate !== undefined &&
      this.datetime.isDateUnderflow(this.datetime.controlDate)
    ) {
      this.#elementInternals.setValidity({
        rangeUnderflow: true,
      }, this.datetime.locale.errorRangeUnderflow.replace('{min}', this.datetime.formatDate(this.datetime.contentAs, new Date(this.datetime.min ?? 0))))
    } else {
      this.#elementInternals.setValidity({})
    }

    this.#elementInternals.setFormValue(this.value)
  }
}
