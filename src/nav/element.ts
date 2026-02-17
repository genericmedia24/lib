import { Nav } from './delegate.js'

export class NavElement extends HTMLElement {
  static attributeNames = {
    expanded: 'expanded',
  }

  static name = 'gm-nav'

  nav: Nav

  get expanded(): boolean {
    return this.nav.isExpanded
  }

  set expanded(value: boolean) {
    this.nav.isExpanded = value
  }

  constructor() {
    super()
    this.nav = new Nav()
    this.nav.attributeNames = NavElement.attributeNames
    this.nav.element = this
  }

  connectedCallback(): void {
    this.nav.connect(this)
  }

  disconnectedCallback(): void {
    this.nav.disconnect()
  }
}
