import { Menu } from './delegate.js'

export class MenuElement extends HTMLElement {
  static attributeNames = {
    axis: 'axis',
    expanded: 'expanded',
    placement: 'placement',
  }

  static name = 'gm-menu'

  menu: Menu

  get axis(): string {
    return this.menu.axis
  }

  set axis(value: null | string) {
    this.menu.axis = value
  }

  get expanded(): boolean {
    return this.menu.isExpanded
  }

  set expanded(value: boolean) {
    this.menu.isExpanded = value
  }

  get placement(): string {
    return this.menu.placement
  }

  set placement(value: null | string) {
    this.menu.placement = value
  }

  constructor() {
    super()
    this.menu = new Menu()
    this.menu.attributeNames = MenuElement.attributeNames
    this.menu.element = this
  }

  connectedCallback(): void {
    this.menu.connect(this)
  }

  disconnectedCallback(): void {
    this.menu.disconnect()
  }
}
