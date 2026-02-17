import { Dialog } from './delegate.js'

export class DialogElement extends HTMLElement {
  static attributeNames = {
    fullscreen: 'fullscreen',
    handleEvents: 'handle-events',
  }

  static name = 'gm-dialog'

  dialog: Dialog

  get fullscreen(): boolean {
    return this.dialog.isFullscreen
  }

  set fullscreen(value: boolean) {
    this.dialog.isFullscreen = value
  }

  get handleEvents(): string {
    return this.dialog.handleEvents
  }

  set handleEvents(value: null | string) {
    this.dialog.handleEvents = value
  }

  constructor() {
    super()
    this.dialog = new Dialog()
    this.dialog.attributeNames = DialogElement.attributeNames
    this.dialog.element = this
  }

  connectedCallback(): void {
    this.dialog.connect(this)
  }

  disconnectedCallback(): void {
    this.dialog.disconnect()
  }
}
