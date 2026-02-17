import { Scrollbar } from './delegate.js'

export class ScrollbarElement extends HTMLElement {
  static attributeNames = {
    active: 'active',
    axis: 'axis',
    minSize: 'min-size',
    noOverflow: 'no-overflow',
  }

  static name = 'gm-scrollbar'

  scrollbar: Scrollbar

  get axis(): string {
    return this.scrollbar.axis
  }

  set axis(value: null | string) {
    this.scrollbar.axis = value
  }

  get minSize(): string {
    return this.scrollbar.minSize.toString()
  }

  set minSize(value: null | string) {
    this.scrollbar.minSize = value === null
      ? null
      : Number(value)
  }

  constructor() {
    super()
    this.scrollbar = new Scrollbar()
    this.scrollbar.attributeNames = ScrollbarElement.attributeNames
    this.scrollbar.element = this
  }

  connectedCallback(): void {
    this.scrollbar.connect(this)
  }

  disconnectedCallback(): void {
    this.scrollbar.disconnect()
  }
}
