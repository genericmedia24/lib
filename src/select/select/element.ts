import { Select } from './delegate.js'

export class SelectElement extends HTMLElement {
  static attributeNames = {
    active: 'active',
    empty: 'empty',
    expanded: 'expanded',
    label: 'label',
    search: 'search',
    selected: 'selected',
    value: 'value',
  }

  static formAssociated = true

  static name = 'gm-select'

  select: Select

  type = 'select-one'

  get disabled(): boolean {
    return this.select.isDisabled
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value)
    this.select.isDisabled = value
  }

  get expanded(): boolean {
    return this.select.isExpanded
  }

  set expanded(value: boolean) {
    this.select.isExpanded = value
  }

  get form(): HTMLFormElement | null {
    return this.#elementInternals.form
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

  get validationMessage(): string {
    return this.#elementInternals.validationMessage
  }

  get validity(): ValidityState {
    return this.#elementInternals.validity
  }

  get value(): null | string {
    return this.select.value
  }

  set value(value: null | string) {
    this.select.value = value
  }

  get willValidate(): boolean {
    return this.#elementInternals.willValidate
  }

  #elementInternals: ElementInternals

  #handleControlChangeBound = this.#handleControlChange.bind(this)

  constructor() {
    super()
    this.#elementInternals = this.attachInternals()
    this.select = new Select()
    this.select.attributeNames = SelectElement.attributeNames
    this.select.element = this
  }

  checkValidity(): boolean {
    return this.#elementInternals.checkValidity()
  }

  connectedCallback(): void {
    this.select.connect(this)
    this.formResetCallback()
    this.#addEventListeners()
  }

  disconnectedCallback(): void {
    this.select.disconnect()
    this.#removeEventListeners()
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled
  }

  formResetCallback(): void {
    this.value = this.select.selectedOption?.value ?? ''
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
    this.select.controlElement?.addEventListener('change', this.#handleControlChangeBound)
  }

  #handleControlChange(): void {
    this.#setFormValue()

    this.dispatchEvent(new Event('change', {
      bubbles: true,
    }))
  }

  #removeEventListeners(): void {
    this.select.controlElement?.removeEventListener('change', this.#handleControlChangeBound)
  }

  #setFormValue(): void {
    if (
      this.hasAttribute('required') &&
      this.value === ''
    ) {
      this.#elementInternals.setValidity({
        valueMissing: true,
      }, this.select.locale.errorValueMissing)
    } else {
      this.#elementInternals.setValidity({})
    }

    this.#elementInternals.setFormValue(this.value)
  }
}
