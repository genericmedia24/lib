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

export class Tab implements Delegate {
  static attributeNames = {
    mode: 'data-mode',
  }

  static defaultMode = 'auto'

  static name = 'tab'

  static style: string = style

  static template: string = template

  activeIndex = -1

  attributeNames = Tab.attributeNames

  element!: HTMLElement

  selectedIndex = -1

  get activeTabElement(): HTMLButtonElement | undefined {
    return this.tabElements.at(this.activeIndex)
  }

  get activeTabPanelElement(): HTMLElement | undefined {
    return this.tabPanelElements.at(this.activeIndex)
  }

  get mode(): string {
    return (
      this.element.getAttribute(this.attributeNames.mode) ??
      Tab.defaultMode
    )
  }

  set mode(value: string) {
    this.element.setAttribute(this.attributeNames.mode, value)
  }

  get selectedTabElement(): HTMLButtonElement | undefined {
    return this.tabElements.at(this.selectedIndex)
  }

  get selectedTabPanelElement(): HTMLElement | undefined {
    return this.tabPanelElements.at(this.selectedIndex)
  }

  get tabElements(): HTMLButtonElement[] {
    return Array.from(this.element.querySelectorAll<HTMLButtonElement>(':scope > button[slot="tablist"]:not([disabled]'))
  }

  get tabPanelElements(): HTMLElement[] {
    const tabElements = this.element.querySelectorAll<HTMLButtonElement>(':scope > button[slot="tablist"]')

    return Array
      .from(this.element.querySelectorAll<HTMLElement>(':scope > :not([slot])'))
      .filter((element, index) => {
        return !tabElements[index].disabled
      })
  }

  #handleTabListClickBound = this.#handleTabListClick.bind(this)

  #handleTabListKeydownBound = this.#handleTabListKeydown.bind(this)

  #tabListElement?: HTMLSlotElement

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
    const { length } = this.tabElements

    return this.moveActiveIndexTo((this.activeIndex + delta + length) % length)
  }

  moveActiveIndexTo(index: number): boolean {
    if (index === this.activeIndex) {
      return false
    }

    this.setActiveIndex(index)

    return true
  }

  setActiveIndex(index: number): void {
    this.activeIndex = index
    this.update()
  }

  setIndex(index: number): void {
    this.activeIndex = index
    this.selectedIndex = index
    this.update()
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex = index
    this.update()
  }

  update(): void {
    this.#updateTabElements()
    this.#updateTabPanelElements()

    this.element.dispatchEvent(new CustomEvent('change', {
      detail: this.selectedIndex,
    }))
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${Tab.style}</style>
        ${Tab.template}
      `
    }

    this.#tabListElement = this.element.shadowRoot?.querySelector<HTMLSlotElement>('[part~="tablist"]') ?? undefined

    const tabElements = Array.from(this.element.querySelectorAll<HTMLButtonElement>(':scope > button[slot="tablist"]'))
    const tabPanelElements = Array.from(this.element.querySelectorAll<HTMLElement>(':scope > :not([slot])'))

    tabElements.forEach((tabElement, index) => {
      if (!tabElement.disabled) {
        tabElement.setAttribute('role', 'tab')
        tabElement.ariaControlsElements = [tabPanelElements[index]]
        tabPanelElements[index].setAttribute('role', 'tabpanel')
        tabPanelElements[index].setAttribute('tabindex', '0')
      }
    })

    this.tabElements.some((tabElement, index) => {
      if (tabElement.disabled) {
        return false
      }

      this.activeIndex = index
      this.selectedIndex = index

      return true
    })

    this.#updateTabElements()
    this.#updateTabPanelElements()
  }

  #connectEventListeners(): void {
    this.#tabListElement?.addEventListener('keydown', this.#handleTabListKeydownBound)
    this.#tabListElement?.addEventListener('click', this.#handleTabListClickBound)
  }

  #disconnectElements(): void {
    this.#tabListElement = undefined
  }

  #disconnectEventListeners(): void {
    this.#tabListElement?.removeEventListener('keydown', this.#handleTabListKeydownBound)
    this.#tabListElement?.removeEventListener('click', this.#handleTabListClickBound)
  }

  #handleTabListClick(event: MouseEvent): void {
    const tabElement = event.target.closest<HTMLButtonElement>('button[role="tab"]')

    if (tabElement !== null) {
      this.setIndex(this.tabElements.indexOf(tabElement))
    }
  }

  #handleTabListKeydown(event: KeyboardEvent): void {
    const tabElement = event.target.closest<HTMLButtonElement>('button')

    if (
      tabElement !== null &&
      tabElement !== this.activeTabElement
    ) {
      this.activeIndex = this.tabElements.indexOf(tabElement)
    }

    if (
      event.code === 'ArrowLeft' ||
      event.code === 'ArrowRight' ||
      event.code === 'End' ||
      event.code === 'Enter' ||
      event.code === 'Home' ||
      event.code === 'Space'
    ) {
      event.preventDefault()

      switch (event.code) {
        case 'ArrowLeft':
          this.moveActiveIndexBy(-1)
          break
        case 'ArrowRight':
          this.moveActiveIndexBy(1)
          break
        case 'End':
          this.moveActiveIndexTo(this.tabElements.length - 1)
          break
        case 'Enter':
          this.setSelectedIndex(this.activeIndex)
          break
        case 'Home':
          this.moveActiveIndexTo(0)
          break
        case 'Space':
          this.setSelectedIndex(this.activeIndex)
          break
        default:
          break
      }

      if (this.mode === 'auto') {
        this.setSelectedIndex(this.activeIndex)
      }

      this.update()
      this.activeTabElement?.focus()
    }
  }

  #updateTabElements(): void {
    const { tabElements } = this

    for (let i = 0, tabElement; i < tabElements.length; i += 1) {
      tabElement = tabElements[i]

      if (i === this.activeIndex) {
        tabElement.setAttribute('tabindex', '0')
      } else {
        tabElement.setAttribute('tabindex', '-1')
      }

      if (i === this.selectedIndex) {
        tabElement.setAttribute('aria-selected', 'true')
      } else {
        tabElement.setAttribute('aria-selected', 'false')
      }
    }
  }

  #updateTabPanelElements(): void {
    const { tabPanelElements } = this

    for (let i = 0; i < tabPanelElements.length; i += 1) {
      tabPanelElements[i].toggleAttribute('hidden', i !== this.selectedIndex)
    }
  }
}
