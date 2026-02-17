import type { Delegate } from '../delegator/index.js'
import { escapeTrap } from '../trap/index.js'
import style from './style.css'
import template from './template.html'

declare global {
  interface FocusEvent {
    target: HTMLElement
  }

  interface MouseEvent {
    target: HTMLElement
  }
}

export class Menu implements Delegate {
  static attributeNames = {
    axis: 'data-axis',
    expanded: 'data-expanded',
    placement: 'data-placement',
  }

  static defaultAxis = 'y'

  static defaultPlacement = 'block-end'

  static name = 'menu'

  static style: string = style

  static template: string = template

  activeIndex = 0

  attributeNames = Menu.attributeNames

  element!: HTMLElement

  popoverElement?: HTMLElement

  toggleElement?: HTMLButtonElement

  get activeElement(): HTMLButtonElement | undefined {
    return this.itemElements.at(this.activeIndex)
  }

  get axis(): string {
    return (
      this.element.getAttribute(this.attributeNames.axis) ??
      Menu.defaultAxis
    )
  }

  set axis(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.axis)
    } else {
      this.element.setAttribute(this.attributeNames.axis, value)
    }
  }

  get directionality(): string {
    return (
      this.element.getAttribute('dir') ??
      document.documentElement.getAttribute('dir') ??
      'ltr'
    )
  }

  get isExpanded(): boolean {
    return this.axis === 'x'
      ? true
      : this.toggleElement?.getAttribute('aria-expanded') === 'true'
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

  get isSubMenu(): boolean {
    return this.element.constructor === this.element.parentElement?.constructor
  }

  get itemElements(): HTMLButtonElement[] {
    return Array.from(this.element.querySelectorAll<HTMLButtonElement>(':scope > button:not([slot]):not([disabled]), :scope > * > button[slot]:not([disabled]'))
  }

  get placement(): string {
    return (
      this.element.getAttribute(this.attributeNames.placement) ??
      Menu.defaultPlacement
    )
  }

  set placement(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.placement)
    } else {
      this.element.setAttribute(this.attributeNames.placement, value)
    }
  }

  #handleElementFocusinBound = this.#handleElementFocusin.bind(this)

  #handleElementKeydownBound = this.#handleElementKeydown.bind(this)

  #handleElementToggleBound = this.#handleElementToggle.bind(this)

  #handleEscapeBound = this.#handleEscape.bind(this)

  #handlePopoverClickBound = this.#handlePopoverClick.bind(this)

  #handlePopoverPointeroutBound = this.#handlePopoverPointerout.bind(this)

  #handlePopoverPointeroverBound = this.#handlePopoverPointerover.bind(this)

  #handleToggleClickBound = this.#handleToggleClick.bind(this)

  #handleWindowClickBound = this.#handleWindowClick.bind(this)

  #mayOpen = false

  close(): void {
    escapeTrap.delete(this.#handleEscapeBound)

    if (this.axis === 'y') {
      this.popoverElement?.hidePopover()
      this.isExpanded = false
      this.setActiveIndex(-1)
    }

    this.#closeChildren()
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.#connectElements()
    this.#connectEventListeners()
    this.#mayOpen = this.axis === 'y'

    if (this.axis === 'x') {
      this.open()
    }
  }

  disconnect(): void {
    this.#disconnectEventListeners()
    this.#disconnectElements()
  }

  moveActiveIndexBy(delta: number): boolean {
    const { length } = this.itemElements

    return this.moveActiveIndexTo((this.activeIndex + delta + length) % length)
  }

  moveActiveIndexForXBy(delta: number): boolean {
    const moved = this.moveActiveIndexBy(delta)

    if (moved) {
      this.#closeChildren()

      if (
        this.#mayOpen &&
        this.activeElement instanceof HTMLElement
      ) {
        this.#dispatchEvent(this.activeElement)
      }
    }

    return moved
  }

  moveActiveIndexTo(index: number): boolean {
    if (index === this.activeIndex) {
      return false
    }

    this.setActiveIndex(index)

    return true
  }

  open(): void {
    this.popoverElement?.showPopover()
    this.isExpanded = true
    escapeTrap.add(this.#handleEscapeBound)
  }

  setActiveIndex(index: number): void {
    this.activeIndex = index
    this.#updateItemElements()
  }

  toggle(): void {
    if (this.isExpanded) {
      this.close()
      this.#dispatchEvent()
    } else {
      this.open()
      this.#dispatchEvent()
    }
  }

  #closeChildren(): void {
    Array
      .from(this.element.children)
      .forEach((element) => {
        (element as { menu?: Menu }).menu?.close()
      })
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${Menu.style}</style>
        ${Menu.template}
      `
    }

    this.popoverElement = this.element.shadowRoot?.querySelector<HTMLElement>('[part~="popover"]') ?? undefined
    this.popoverElement?.setAttribute('role', this.axis === 'y' ? 'menu' : 'menubar')
    this.toggleElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="toggle"]') ?? undefined
    this.toggleElement?.setAttribute('aria-expanded', 'false')
    this.toggleElement?.setAttribute('aria-haspopup', 'true')
    this.toggleElement?.setAttribute('role', 'menuitem')

    const itemElements = Array.from(this.element.querySelectorAll<HTMLButtonElement>(':scope > button:not([slot]), :scope > * > button[slot]'))

    for (const itemElement of itemElements) {
      itemElement.setAttribute('role', 'menuitem')
      itemElement.setAttribute('tabindex', '-1')
    }

    if (!this.isSubMenu) {
      this
        .itemElements
        .at(0)
        ?.setAttribute('tabindex', '0')
    }
  }

  #connectEventListeners(): void {
    this.element.addEventListener('focusin', this.#handleElementFocusinBound)
    this.element.addEventListener('keydown', this.#handleElementKeydownBound)
    this.element.addEventListener('toggle', this.#handleElementToggleBound)
    this.popoverElement?.addEventListener('pointerover', this.#handlePopoverPointeroverBound)
    this.popoverElement?.addEventListener('pointerout', this.#handlePopoverPointeroutBound)
    this.popoverElement?.addEventListener('click', this.#handlePopoverClickBound)
    this.toggleElement?.addEventListener('click', this.#handleToggleClickBound)
    window.addEventListener('click', this.#handleWindowClickBound)
  }

  #disconnectElements(): void {
    this.popoverElement = undefined
    this.toggleElement = undefined
  }

  #disconnectEventListeners(): void {
    this.element.removeEventListener('focusin', this.#handleElementFocusinBound)
    this.element.removeEventListener('keydown', this.#handleElementKeydownBound)
    this.element.removeEventListener('toggle', this.#handleElementToggleBound)
    this.popoverElement?.removeEventListener('pointerover', this.#handlePopoverPointeroverBound)
    this.popoverElement?.removeEventListener('pointerout', this.#handlePopoverPointeroutBound)
    this.popoverElement?.removeEventListener('click', this.#handlePopoverClickBound)
    this.toggleElement?.removeEventListener('click', this.#handleToggleClickBound)
    window.removeEventListener('click', this.#handleWindowClickBound)
  }

  #dispatchEvent(element = this.element): void {
    element.dispatchEvent(new ToggleEvent('toggle', {
      bubbles: true,
      newState: this.isExpanded ? 'expanded' : 'collapsed',
      oldState: this.isExpanded ? 'collapsed' : 'expanded',
    }))
  }

  #handleElementFocusin(event: FocusEvent): void {
    const itemElement = event.target.closest<HTMLButtonElement>('button')

    if (itemElement !== null) {
      const index = this.itemElements.indexOf(itemElement)

      if (index > -1) {
        this.setActiveIndex(index)
      }
    }
  }

  #handleElementKeydown(event: KeyboardEvent): void {
    if (event.code === 'Tab') {
      this.close()
      this.#dispatchEvent()
    } else if (this.isExpanded) {
      this.#handleKeydown(event)
    } else if (
      event.code === 'ArrowDown' ||
      event.code === 'ArrowUp' ||
      event.code === 'ArrowRight'
    ) {
      switch (event.code) {
        case 'ArrowDown':
          if (
            this.axis === 'y' &&
            this.placement === 'block-end'
          ) {
            this.open()
            this.moveActiveIndexTo(0)
            this.#dispatchEvent()
          }

          break
        case 'ArrowRight':
          if (
            this.axis === 'y' &&
            this.placement === 'inline-end'
          ) {
            event.stopPropagation()
            this.open()
            this.moveActiveIndexTo(0)
            this.#dispatchEvent()
          }

          break
        case 'ArrowUp':
          if (
            this.axis === 'y' &&
            this.placement === 'block-end'
          ) {
            event.stopPropagation()
            this.open()
            this.moveActiveIndexTo(this.itemElements.length - 1)
            this.#dispatchEvent()
          }

          break
        default:
          break
      }
    }
  }

  #handleElementToggle(event: ToggleEvent): void {
    if (this.axis === 'x') {
      event.stopPropagation()
      this.#mayOpen = event.newState === 'expanded'
    } else if (event.target === this.toggleElement) {
      event.stopPropagation()
      this.open()
    }
  }

  #handleEscape(): void {
    this.close()
    this.#dispatchEvent()
    this.toggleElement?.focus()
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (
      event.code === 'ArrowDown' ||
      event.code === 'ArrowLeft' ||
      event.code === 'ArrowRight' ||
      event.code === 'ArrowUp' ||
      event.code === 'End' ||
      event.code === 'Home'
    ) {
      event.preventDefault()

      switch (event.code) {
        case 'ArrowDown':
          if (this.axis === 'y') {
            event.stopPropagation()
            this.moveActiveIndexBy(1)
          }

          break
        case 'ArrowLeft':
          if (this.axis === 'x') {
            event.stopPropagation()

            if (this.directionality === 'rtl') {
              this.moveActiveIndexForXBy(1)
            } else {
              this.moveActiveIndexForXBy(-1)
            }
          } else if (this.placement === 'inline-end') {
            event.stopPropagation()
            this.close()
            this.toggleElement?.focus()
          }

          break
        case 'ArrowRight':
          if (this.axis === 'x') {
            event.stopPropagation()

            if (this.directionality === 'rtl') {
              this.moveActiveIndexForXBy(-1)
            } else {
              this.moveActiveIndexForXBy(1)
            }
          }

          break
        case 'ArrowUp':
          if (this.axis === 'y') {
            event.stopPropagation()
            this.moveActiveIndexBy(-1)
          }

          break
        case 'End':
          event.stopPropagation()
          this.moveActiveIndexTo(this.itemElements.length - 1)
          break
        case 'Home':
          event.stopPropagation()
          this.moveActiveIndexTo(0)
          break
        default:
          break
      }
    }
  }

  #handlePopoverClick(event: MouseEvent): void {
    if (event.target.closest('[slot="toggle"]') === null) {
      this.close()
      this.#dispatchEvent()
    }
  }

  #handlePopoverPointerout(event: MouseEvent): void {
    if (!this.#mayOpen) {
      event.stopPropagation()

      this.itemElements.forEach((itemElement) => {
        itemElement.blur()
      })
    }
  }

  #handlePopoverPointerover(event: MouseEvent): void {
    if (this.#mayOpen) {
      event.stopPropagation()

      const toggleElement = event.target.closest<HTMLButtonElement>('button')

      if (toggleElement !== null) {
        toggleElement.focus()
        this.#closeChildren()
        this.#dispatchEvent(toggleElement)
      }
    }
  }

  #handleToggleClick(event: MouseEvent): void {
    event.stopPropagation()
    this.toggle()

    if (event.detail === 0) {
      this.moveActiveIndexTo(0)
    }
  }

  #handleWindowClick(event: MouseEvent): void {
    if (
      !this.element.contains(event.target) &&
      this.popoverElement?.contains(event.target) === false
    ) {
      this.close()
      this.#dispatchEvent()
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
