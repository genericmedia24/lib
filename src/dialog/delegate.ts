import type { Delegate } from '../delegator/index.js'
import { escapeTrap, TabTrap } from '../trap/index.js'
import style from './style.css'
import template from './template.html'

export class Dialog implements Delegate {
  static attributeNames = {
    fullscreen: 'data-fullscreen',
    handleEvents: 'data-handle-events',
  }

  static defaultHandleEvents = 'dismiss escape'

  static name = 'dialog'

  static style: string = style

  static template: string = template

  attributeNames = Dialog.attributeNames

  dialogElement?: HTMLDialogElement

  element!: HTMLElement

  footerConfirmButtonElement?: HTMLButtonElement

  footerDismissButtonElement?: HTMLButtonElement

  headerConfirmButtonElement?: HTMLButtonElement

  headerDismissButtonElement?: HTMLButtonElement

  get focusableElements(): HTMLElement[] {
    return Array.from(this.element.querySelectorAll<HTMLElement>('[tabindex="0"], a, button, input, select, textarea'))
  }

  get handleEvents(): string {
    return (
      this.element.getAttribute(this.attributeNames.handleEvents) ??
      Dialog.defaultHandleEvents
    )
  }

  set handleEvents(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.handleEvents)
    } else {
      this.element.setAttribute(this.attributeNames.handleEvents, value)
    }
  }

  get isFullscreen(): boolean {
    return this.element.hasAttribute(this.attributeNames.fullscreen)
  }

  set isFullscreen(value: boolean) {
    this.element.toggleAttribute(this.attributeNames.fullscreen, value)
  }

  get isOpen(): boolean {
    return this.dialogElement?.open === true
  }

  #activeElement?: HTMLElement

  #handleEscapeBound = this.#handleEscape.bind(this)

  #handleFooterConfirmClickBound = this.#handleFooterConfirmClick.bind(this)

  #handleFooterDismissClickBound = this.#handleFooterDismissClick.bind(this)

  #handleHeaderConfirmClickBound = this.#handleHeaderConfirmClick.bind(this)

  #handleHeaderDismissClickBound = this.#handleHeaderDismissClick.bind(this)

  #tabTrap?: TabTrap

  close(returnValue?: string): void {
    this.#activeElement?.focus()
    this.#activeElement = undefined

    if (this.handleEvents.includes('escape')) {
      escapeTrap.delete(this.#handleEscapeBound)
    }

    this.dialogElement?.close(returnValue)

    this.element.dispatchEvent(new ToggleEvent('toggle', {
      newState: 'closed',
      oldState: 'open',
    }))
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.#connectElements()
    this.#connectTabTrap()
    this.#connectEventListeners()
  }

  disconnect(): void {
    this.#disconnectEventListeners()
    this.#disconnectTabTrap()
    this.#disconnectElements()
  }

  focus(): void {
    const focusableElement = this.focusableElements.find((element) => {
      return element.slot === ''
    })

    if (focusableElement === undefined) {
      this.headerDismissButtonElement?.focus()
      this.footerDismissButtonElement?.focus()
    } else {
      focusableElement.focus()
    }
  }

  open(): void {
    if (document.activeElement instanceof HTMLElement) {
      this.#activeElement = document.activeElement
    }

    this.dialogElement?.showModal()

    if (this.handleEvents.includes('escape')) {
      escapeTrap.add(this.#handleEscapeBound)
    }

    this.focus()

    this.element.dispatchEvent(new ToggleEvent('toggle', {
      newState: 'open',
      oldState: 'closed',
    }))
  }

  setHTML(html: string): void {
    this.disconnect()
    this.element.innerHTML = html
    this.connect(this.element)
    this.focus()
  }

  toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${Dialog.style}</style>
        ${Dialog.template}
      `
    }

    this.dialogElement = this.element.shadowRoot?.querySelector<HTMLDialogElement>('dialog[part~="dialog"]') ?? undefined
    this.footerConfirmButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="footer-confirm"]') ?? undefined
    this.footerDismissButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="footer-dismiss"]') ?? undefined
    this.headerConfirmButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="header-confirm"]') ?? undefined
    this.headerDismissButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="header-dismiss"]') ?? undefined
  }

  #connectEventListeners(): void {
    if (this.handleEvents.includes('confirm')) {
      this.footerConfirmButtonElement?.addEventListener('click', this.#handleFooterConfirmClickBound)
      this.headerConfirmButtonElement?.addEventListener('click', this.#handleHeaderConfirmClickBound)
    }

    if (this.handleEvents.includes('dismiss')) {
      this.footerDismissButtonElement?.addEventListener('click', this.#handleFooterDismissClickBound)
      this.headerDismissButtonElement?.addEventListener('click', this.#handleHeaderDismissClickBound)
    }
  }

  #connectTabTrap(): void {
    if (this.dialogElement !== undefined) {
      this.#tabTrap = new TabTrap(this.dialogElement)
      this.#tabTrap.add(...this.focusableElements)
      this.#tabTrap.observe()
    }
  }

  #disconnectElements(): void {
    this.dialogElement = undefined
    this.footerConfirmButtonElement = undefined
    this.footerDismissButtonElement = undefined
    this.headerConfirmButtonElement = undefined
    this.headerDismissButtonElement = undefined
  }

  #disconnectEventListeners(): void {
    if (this.handleEvents.includes('confirm')) {
      this.footerConfirmButtonElement?.removeEventListener('click', this.#handleFooterConfirmClickBound)
      this.headerConfirmButtonElement?.removeEventListener('click', this.#handleHeaderConfirmClickBound)
    }

    if (this.handleEvents.includes('dismiss')) {
      this.footerDismissButtonElement?.removeEventListener('click', this.#handleFooterDismissClickBound)
      this.headerDismissButtonElement?.removeEventListener('click', this.#handleHeaderDismissClickBound)
    }
  }

  #disconnectTabTrap(): void {
    this.#tabTrap?.disconnect()
    this.#tabTrap = undefined
  }

  #handleEscape(): void {
    this.dialogElement?.close()
  }

  #handleFooterConfirmClick(): void {
    this.close('confirm')
  }

  #handleFooterDismissClick(): void {
    this.close('dismiss')
  }

  #handleHeaderConfirmClick(): void {
    this.close('confirm')
  }

  #handleHeaderDismissClick(): void {
    this.close('dismiss')
  }
}
