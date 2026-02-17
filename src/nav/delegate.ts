import type { Delegate } from '../delegator/index.js'
import style from './style.css'
import template from './template.html'

declare global {
  interface KeyboardEvent {
    target: HTMLElement
  }

  interface MouseEvent {
    target: HTMLElement
  }
}

export class Nav implements Delegate {
  static attributeNames = {
    expanded: 'data-expanded',
  }

  static name = 'nav'

  static style: string = style

  static template: string = template

  activeIndex = 0

  attributeNames = Nav.attributeNames

  element!: HTMLElement

  toggleElement?: HTMLButtonElement

  get activeElement(): HTMLButtonElement | undefined {
    return this.itemElements.at(this.activeIndex)
  }

  get isExpanded(): boolean {
    return this.toggleElement?.getAttribute('aria-expanded') === 'true'
  }

  set isExpanded(value: boolean) {
    if (value) {
      this.element.toggleAttribute(this.attributeNames.expanded, true)
      this.toggleElement?.setAttribute('aria-expanded', 'true')
    } else {
      this.element.toggleAttribute(this.attributeNames.expanded, false)
      this.toggleElement?.setAttribute('aria-expanded', 'false')
    }
  }

  get itemElements(): HTMLButtonElement[] {
    return Array.from(this.element.querySelectorAll<HTMLButtonElement>(':scope > button:not([disabled])'))
  }

  #handleElementClickBound = this.#handleElementClick.bind(this)

  #handleElementKeydownBound = this.#handleElementKeydown.bind(this)

  close(): void {
    this.isExpanded = false

    this.element.dispatchEvent(new ToggleEvent('toggle', {
      newState: 'collapsed',
      oldState: 'expanded',
    }))
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

  moveActiveIndexBy(delta: number): boolean {
    const { length } = this.itemElements

    return this.moveActiveIndexTo((this.activeIndex + delta + length) % length)
  }

  moveActiveIndexTo(index: number): boolean {
    if (index === this.activeIndex) {
      return false
    }

    this.setActiveIndex(index)

    return true
  }

  open(): void {
    this.isExpanded = true

    this.element.dispatchEvent(new ToggleEvent('toggle', {
      newState: 'expanded',
      oldState: 'collapsed',
    }))
  }

  setActiveIndex(index: number): void {
    this.activeIndex = index
    this.#updateItemElements()
  }

  toggle(): void {
    if (this.isExpanded) {
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
        <style>${Nav.style}</style>
        ${Nav.template}
      `
    }

    const itemElements = Array.from(this.element.querySelectorAll<HTMLButtonElement>(':scope > button'))

    for (const itemElement of itemElements) {
      itemElement.setAttribute('role', 'menuitem')
      itemElement.setAttribute('tabindex', '-1')

      if (itemElement.hasAttribute('aria-controls')) {
        this.toggleElement = itemElement
        itemElement.setAttribute('aria-expanded', 'true')
      }
    }

    this.activeElement?.setAttribute('tabindex', '0')
  }

  #connectEventListeners(): void {
    this.element.addEventListener('click', this.#handleElementClickBound)
    this.element.addEventListener('keydown', this.#handleElementKeydownBound)
  }

  #disconnectElements(): void {
    this.toggleElement = undefined
  }

  #disconnectEventListeners(): void {
    this.element.removeEventListener('click', this.#handleElementClickBound)
    this.element.removeEventListener('keydown', this.#handleElementKeydownBound)
  }

  #handleElementClick(event: MouseEvent): void {
    const itemElement = event.target.closest<HTMLButtonElement>('button')

    if (itemElement !== null) {
      const index = this.itemElements.indexOf(itemElement)

      if (index > -1) {
        this.setActiveIndex(index)
      }

      if (itemElement === this.toggleElement) {
        this.toggle()
      }
    }
  }

  #handleElementKeydown(event: KeyboardEvent): void {
    const itemElement = event.target.closest<HTMLButtonElement>('button')

    if (
      itemElement !== null &&
      itemElement !== this.activeElement
    ) {
      this.activeIndex = this.itemElements.indexOf(itemElement)
    }

    if (
      event.code === 'ArrowDown' ||
      event.code === 'ArrowUp' ||
      event.code === 'End' ||
      event.code === 'Home'
    ) {
      event.preventDefault()

      switch (event.code) {
        case 'ArrowDown':
          this.moveActiveIndexBy(1)
          break
        case 'ArrowUp':
          this.moveActiveIndexBy(-1)
          break
        case 'End':
          this.moveActiveIndexTo(this.itemElements.length - 1)
          break
        case 'Home':
          this.moveActiveIndexTo(0)
          break
        default:
          break
      }
    }
  }

  #updateItemElements(): void {
    const { itemElements } = this

    for (let i = 0, itemElement; i < itemElements.length; i += 1) {
      itemElement = itemElements[i]

      if (i === this.activeIndex) {
        itemElement.setAttribute('tabindex', '0')
        itemElement.focus()
      } else {
        itemElement.setAttribute('tabindex', '-1')
      }
    }
  }
}
