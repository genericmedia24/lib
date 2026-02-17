import { Tab } from './delegate.js'

export class TabElement extends HTMLElement {
  static attributeNames = {
    mode: 'mode',
  }

  static name = 'gm-tab'

  tab: Tab

  constructor() {
    super()
    this.tab = new Tab()
    this.tab.attributeNames = TabElement.attributeNames
    this.tab.element = this
  }

  connectedCallback(): void {
    this.tab.connect(this)
  }

  disconnectedCallback(): void {
    this.tab.disconnect()
  }
}
