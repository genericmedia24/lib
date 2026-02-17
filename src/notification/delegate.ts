import type { Delegate } from '../delegator/index.js'
import { escapeTrap } from '../trap/index.js'
import style from './style.css'
import template from './template.html'

export interface NotificationLocale {
  closeButtonLabel: string
}

export class Notification implements Delegate {
  static activeElement?: HTMLElement

  static attributeNames = {
    timeout: 'data-timeout',
  }

  static current = undefined as (() => void) | undefined

  static defaultTimeout = 5000

  static name = 'notification'

  static stack = [] as Array<() => void>

  static style = style

  static template = template

  attributeNames = Notification.attributeNames

  closeButtonElement?: HTMLButtonElement

  element!: HTMLElement

  popoverElement?: HTMLElement

  get timeout(): number {
    return Number(
      this.element.getAttribute(this.attributeNames.timeout) ??
      Notification.defaultTimeout,
    )
  }

  set timeout(value: null | number) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.timeout)
    } else {
      this.element.setAttribute(this.attributeNames.timeout, value.toString())
    }
  }

  #handleCloseClickBound = this.#handleCloseClick.bind(this)

  #handleEscapeBound = this.#handleEscape.bind(this)

  close(): void {
    escapeTrap.delete(this.#handleEscapeBound)
    this.element.remove()
    Notification.current = Notification.stack.shift()
    Notification.current?.()

    if (Notification.current === undefined) {
      Notification.activeElement?.focus()
      Notification.activeElement = undefined
    }
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.#connectElements()
    this.#connectEventListeners()
  }

  disconnect(): void {
    this.#disconnectEventListeners()
    this.#disconnectElements()
  }

  open(): void {
    this.popoverElement?.showPopover()
    escapeTrap.add(this.#handleEscapeBound)

    const { timeout } = this

    if (timeout !== -1) {
      window.setTimeout(() => {
        this.close()
      }, timeout)
    }

    window.setTimeout(() => {
      this.closeButtonElement?.focus()
    }, 50)
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${Notification.style}</style>
        ${Notification.template}
      `
    }

    this.closeButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="close"]') ?? undefined
    this.popoverElement = this.element.shadowRoot?.querySelector<HTMLElement>('[part~="popover"]') ?? undefined

    if (document.activeElement instanceof HTMLElement) {
      Notification.activeElement = document.activeElement
    }
  }

  #connectEventListeners(): void {
    this.closeButtonElement?.addEventListener('click', this.#handleCloseClickBound)
  }

  #disconnectElements(): void {
    this.closeButtonElement = undefined
    this.popoverElement = undefined
  }

  #disconnectEventListeners(): void {
    this.closeButtonElement?.removeEventListener('click', this.#handleCloseClickBound)
  }

  #handleCloseClick(): void {
    this.close()
  }

  #handleEscape(): void {
    this.close()
  }
}
