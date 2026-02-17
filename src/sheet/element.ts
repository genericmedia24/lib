import { Sheet } from './delegate.js'

export class SheetElement extends HTMLElement {
  static attributeNames = {
    expanded: 'expanded',
    handleEvents: 'handle-events',
    modal: 'modal',
    moveThreshold: 'move-threshold',
    placement: 'placement',
  }

  static name = 'gm-sheet'

  sheet: Sheet

  get expanded(): boolean {
    return this.sheet.isExpanded
  }

  set expanded(value: boolean) {
    this.sheet.isExpanded = value
  }

  get handleEvents(): string {
    return this.sheet.handleEvents
  }

  set handleEvents(value: null | string) {
    this.sheet.handleEvents = value
  }

  get initialInset(): string {
    return this.sheet.initialInset
  }

  set initialInset(value: null | string) {
    this.sheet.initialInset = value
  }

  get maxInset(): string {
    return this.sheet.maxInset
  }

  set maxInset(value: null | string) {
    this.sheet.maxInset = value
  }

  get modal(): boolean {
    return this.sheet.isModal
  }

  set modal(value: boolean) {
    this.sheet.isModal = value
  }

  get moveThreshold(): number {
    return this.sheet.moveThreshold
  }

  set moveThreshold(value: null | number) {
    this.sheet.moveThreshold = value
  }

  get placement(): string {
    return this.sheet.placement
  }

  set placement(value: null | string) {
    this.sheet.placement = value
  }

  constructor() {
    super()
    this.sheet = new Sheet()
    this.sheet.attributeNames = SheetElement.attributeNames
    this.sheet.element = this
  }

  connectedCallback(): void {
    this.sheet.connect(this)
  }

  disconnectedCallback(): void {
    this.sheet.disconnect()
  }
}
