import type { Delegate } from '../delegator/index.js'
import { type MoveEvent, MoveObserver } from '../observer/index.js'
import { escapeTrap, TabTrap } from '../trap/index.js'
import style from './style.css'
import template from './template.html'

declare global {
  interface MouseEvent {
    target: HTMLElement
  }
}

export class Sheet implements Delegate {
  static attributeNames = {
    expanded: 'data-expanded',
    handleEvents: 'data-handle-events',
    modal: 'data-modal',
    moveThreshold: 'data-move-threshold',
    placement: 'data-placement',
  }

  static defaultHandleEventsBlock = 'dismiss escape expand'

  static defaultHandleEventsInline = 'dismiss escape'

  static defaultInitialInset = '70vh'

  static defaultMaxInset = '3em'

  static defaultMoveThreshold = 30

  static defaultPlacement = 'inline-end'

  static name = 'sheet'

  static style: string = style

  static template: string = template

  asideElement?: HTMLElement

  attributeNames = Sheet.attributeNames

  element!: HTMLElement

  footerDismissButtonElement?: HTMLButtonElement

  headerDismissButtonElement?: HTMLButtonElement

  toggleElement?: HTMLButtonElement

  get focusableElements(): HTMLElement[] {
    return Array.from(this.element.querySelectorAll<HTMLElement>('[tabindex="0"], a, button, input, select, textarea'))
  }

  get handleEvents(): string {
    return (
      this.element.getAttribute(this.attributeNames.handleEvents) ?? (
        this.placement.startsWith('block')
          ? Sheet.defaultHandleEventsBlock
          : Sheet.defaultHandleEventsInline
      )
    )
  }

  set handleEvents(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.handleEvents)
    } else {
      this.element.setAttribute(this.attributeNames.handleEvents, value)
    }
  }

  get initialInset(): string {
    const value = this.element.style.getPropertyValue('--initial-inset')

    return value === ''
      ? Sheet.defaultInitialInset
      : value
  }

  set initialInset(value: null | string) {
    if (value === null) {
      this.element.style.removeProperty('--initial-inset')
    } else {
      this.element.style.setProperty('--initial-inset', value)
    }
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

  get isModal(): boolean {
    return this.element.hasAttribute(this.attributeNames.modal)
  }

  set isModal(value: boolean) {
    this.element.toggleAttribute(this.attributeNames.modal, value)
  }

  get isOpen(): boolean {
    return this.asideElement?.hasAttribute('popover') === true
  }

  get maxInset(): string {
    const value = this.element.style.getPropertyValue('--max-inset')

    return value === ''
      ? Sheet.defaultMaxInset
      : value
  }

  set maxInset(value: null | string) {
    if (value === null) {
      this.element.style.removeProperty('--max-inset')
    } else {
      this.element.style.setProperty('--max-inset', value)
    }
  }

  get moveThreshold(): number {
    return Number(
      this.element.getAttribute(this.attributeNames.moveThreshold) ??
      Sheet.defaultMoveThreshold,
    )
  }

  set moveThreshold(value: null | number) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.moveThreshold)
    } else {
      this.element.setAttribute(this.attributeNames.moveThreshold, value.toString())
    }
  }

  get placement(): string {
    return (
      this.element.getAttribute(this.attributeNames.placement) ??
      Sheet.defaultPlacement
    )
  }

  set placement(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.placement)
    } else {
      this.element.setAttribute(this.attributeNames.placement, value)
    }
  }

  #activeElement?: HTMLElement

  #handleEscapeBound = this.#handleEscape.bind(this)

  #handleFooterDismissClickBound = this.#handleFooterDismissClick.bind(this)

  #handleHeaderDismissClickBound = this.#handleHeaderDismissClick.bind(this)

  #handleMoveBound = this.#handleMove.bind(this)

  #handleToggleClickBound = this.#handleToggleClick.bind(this)

  #handleWindowClickBound = this.#handleWindowClick.bind(this)

  #moveObserver?: MoveObserver

  #tabTrap?: TabTrap

  close(): void {
    this.#activeElement?.focus()
    this.#activeElement = undefined

    if (this.isModal) {
      if (this.handleEvents.includes('escape')) {
        escapeTrap.delete(this.#handleEscapeBound)
      }

      this.asideElement?.hidePopover()

      window.setTimeout(() => {
        this.asideElement?.removeAttribute('popover')
      })
    } else {
      this.asideElement?.setAttribute('hidden', '')
    }

    this.element.dispatchEvent(new ToggleEvent('toggle', {
      newState: 'closed',
      oldState: 'open',
    }))
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.#connectElements()
    this.#connectMoveObserver()
    this.#connectTabTrap()
    this.#connectEventListeners()
  }

  disconnect(): void {
    this.#disconnectEventListeners()
    this.#disconnectTabTrap()
    this.#disconnectMoveObserver()
    this.#disconnectElements()
  }

  focus(): void {
    this.toggleElement?.focus()
  }

  open(): void {
    if (document.activeElement instanceof HTMLElement) {
      this.#activeElement = document.activeElement
    }

    if (this.isModal) {
      this.asideElement?.setAttribute('popover', 'manual')
      this.asideElement?.showPopover()

      if (this.handleEvents.includes('escape')) {
        escapeTrap.add(this.#handleEscapeBound)
      }
    } else {
      this.asideElement?.removeAttribute('hidden')
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
        <style>${Sheet.style}</style>
        ${Sheet.template}
      `
    }

    this.asideElement = this.element.shadowRoot?.querySelector<HTMLElement>('[part~="aside"]') ?? undefined

    if (this.placement.startsWith('block')) {
      this.asideElement?.style.setProperty('--default-max-inset', Sheet.defaultMaxInset)
      this.asideElement?.style.setProperty('--default-initial-inset', Sheet.defaultInitialInset)
    }

    if (this.isModal) {
      this.asideElement?.removeAttribute('hidden')
    }

    this.footerDismissButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="footer-dismiss"]') ?? undefined
    this.headerDismissButtonElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="header-dismiss"]') ?? undefined
    this.toggleElement = this.element.querySelector<HTMLButtonElement>(':scope > button[slot="toggle"]') ?? undefined
    this.toggleElement?.setAttribute('aria-expanded', 'false')
  }

  #connectEventListeners(): void {
    if (this.handleEvents.includes('dismiss')) {
      this.footerDismissButtonElement?.addEventListener('click', this.#handleFooterDismissClickBound)
      this.headerDismissButtonElement?.addEventListener('click', this.#handleHeaderDismissClickBound)
    }

    if (this.handleEvents.includes('expand')) {
      this.toggleElement?.addEventListener('click', this.#handleToggleClickBound)
    }

    window.addEventListener('click', this.#handleWindowClickBound)
  }

  #connectMoveObserver(): void {
    if (
      this.handleEvents.includes('expand') &&
      this.placement.startsWith('block') &&
      this.toggleElement !== undefined
    ) {
      this.#moveObserver = new MoveObserver(this.#handleMoveBound)
      this.#moveObserver.observe(this.toggleElement)
    }
  }

  #connectTabTrap(): void {
    if (
      this.isModal &&
      this.asideElement !== undefined
    ) {
      this.#tabTrap = new TabTrap(this.asideElement)
      this.#tabTrap.add(...this.focusableElements)
      this.#tabTrap.observe()
    }
  }

  #disconnectElements(): void {
    this.asideElement = undefined
    this.footerDismissButtonElement = undefined
    this.headerDismissButtonElement = undefined
    this.toggleElement = undefined
  }

  #disconnectEventListeners(): void {
    if (this.handleEvents.includes('dismiss')) {
      this.footerDismissButtonElement?.removeEventListener('click', this.#handleFooterDismissClickBound)
      this.headerDismissButtonElement?.removeEventListener('click', this.#handleHeaderDismissClickBound)
    }

    if (this.handleEvents.includes('expand')) {
      this.toggleElement?.removeEventListener('click', this.#handleToggleClickBound)
    }

    window.removeEventListener('click', this.#handleWindowClickBound)
  }

  #disconnectMoveObserver(): void {
    if (
      this.handleEvents.includes('expand') &&
      this.placement.startsWith('block') &&
      this.toggleElement !== undefined
    ) {
      this.#moveObserver?.disconnect()
    }
  }

  #disconnectTabTrap(): void {
    if (
      this.isModal &&
      this.asideElement !== undefined
    ) {
      this.#tabTrap?.disconnect()
      this.#tabTrap = undefined
    }
  }

  #handleEscape(): void {
    this.close()
  }

  #handleFooterDismissClick(): void {
    this.close()
  }

  #handleHeaderDismissClick(): void {
    this.close()
  }

  #handleMove(event: MoveEvent): void {
    const asideRect = this.asideElement?.getBoundingClientRect() ?? new DOMRect()
    const asideStyle = window.getComputedStyle(this.asideElement ?? this.element)

    const insetProperty: string = this.placement === 'block-end'
      ? 'inset-block-start'
      : 'inset-block-end'

    const initialInsetValue = (parseFloat(this.initialInset) / 100) * window.innerHeight
    const maxInsetValue = parseFloat(this.maxInset) * parseFloat(asideStyle.getPropertyValue('font-size'))

    const insetValue = insetProperty === 'inset-block-start'
      ? asideRect.top + event.dy
      : window.innerHeight - (asideRect.bottom + event.dy)

    if (event.type === 'move') {
      this.asideElement?.style.setProperty(insetProperty, `${Math.max(maxInsetValue, insetValue)}px`)
    } else if (event.type === 'up') {
      this.asideElement?.style.removeProperty(insetProperty)

      if (this.placement === 'block-end') {
        if (event.directionY === 'up') {
          if (event.clientY0 - event.clientY > this.moveThreshold) {
            this.isExpanded = true
          }
        } else if (event.directionY === 'down') {
          if (insetValue > initialInsetValue) {
            this.close()
          } else {
            this.isExpanded = !(event.clientY0 - event.clientY < this.moveThreshold * -1)
          }
        }
      } else if (this.placement === 'block-start') {
        if (event.directionY === 'down') {
          if (event.clientY0 - event.clientY < this.moveThreshold * -1) {
            this.isExpanded = true
          }
        } else if (event.directionY === 'up') {
          if (insetValue > initialInsetValue) {
            this.close()
          } else {
            this.isExpanded = !(event.clientY0 - event.clientY > this.moveThreshold)
          }
        }
      }
    }
  }

  #handleToggleClick(event: MouseEvent): void {
    event.stopPropagation()
    this.isExpanded = !this.isExpanded
  }

  #handleWindowClick(event: MouseEvent): void {
    if (
      this.isModal &&
      !this.element.contains(event.target) &&
      this.asideElement?.contains(event.target) === false
    ) {
      this.close()
    }
  }
}
