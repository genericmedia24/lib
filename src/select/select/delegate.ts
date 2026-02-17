import type { Delegate } from '../../delegator/index.js'
import { escapeTrap, TabTrap } from '../../trap/index.js'
import locales from './locales.json'
import style from './style.css'
import template from './template.html'

declare global {
  interface MouseEvent {
    target: HTMLElement
  }
}

export interface SelectGroup {
  disabled: boolean
  label?: string
  options: SelectOption[]
  tagName?: string
}

export interface SelectLocale {
  errorValueMissing: string
}

export interface SelectOption {
  disabled: boolean
  group?: SelectGroup
  innerHTML?: string
  label?: string
  selected: boolean
  tagName?: string
  textContent: string
  value: string
}

export class Select implements Delegate {
  static attributeNames = {
    active: 'data-active',
    empty: 'data-empty',
    expanded: 'data-expanded',
    label: 'data-label',
    search: 'data-search',
    selected: 'data-selected',
    value: 'data-value',
  }

  static locales: Record<string, SelectLocale | undefined> = locales

  static name = 'select'

  static style: string = style

  static template: string = template

  activeOption?: SelectOption

  attributeNames = Select.attributeNames

  buttonElement?: HTMLButtonElement

  contentElement?: HTMLButtonElement

  controlElement?: HTMLInputElement

  element!: HTMLElement

  groups: SelectGroup[] = []

  options: SelectOption[] = []

  popoverElement?: HTMLElement

  searchElement?: HTMLInputElement

  selectedOption?: SelectOption

  visibleOptions: SelectOption[] = []

  get isDisabled(): boolean {
    return this.contentElement?.hasAttribute('disabled') ?? false
  }

  set isDisabled(value: boolean) {
    if (value) {
      this.contentElement?.setAttribute('aria-disabled', 'true')
      this.contentElement?.toggleAttribute('disabled', true)
    } else {
      this.contentElement?.removeAttribute('aria-disabled')
      this.contentElement?.toggleAttribute('disabled', false)
    }
  }

  get isExpanded(): boolean {
    return this.contentElement?.getAttribute('aria-expanded') === 'true'
  }

  set isExpanded(value: boolean) {
    if (value) {
      this.element.toggleAttribute(this.attributeNames.expanded, true)
      this.contentElement?.setAttribute('aria-expanded', 'true')
      this.searchElement?.setAttribute('aria-expanded', 'true')
    } else {
      this.element.toggleAttribute(this.attributeNames.expanded, false)
      this.contentElement?.setAttribute('aria-expanded', 'false')
      this.searchElement?.setAttribute('aria-expanded', 'false')
    }
  }

  get language(): string {
    return (
      this.element.getAttribute('lang') ??
      document.documentElement.getAttribute('lang') ??
      navigator.language
    )
  }

  set language(value: null | string) {
    if (value === null) {
      this.element.removeAttribute('lang')
    } else {
      this.element.setAttribute('lang', value)
    }
  }

  get locale(): SelectLocale {
    const language = this.language.toLowerCase()

    return (
      Select.locales[language] ??
      Select.locales[language.split('-').shift() ?? ''] ??
      Select.locales.en ??
      {} as SelectLocale
    )
  }

  get optionElements(): HTMLElement[] {
    return Array.from(this.element.querySelectorAll<HTMLElement>(':scope > [role="option"]'))
  }

  get search(): null | string {
    return this.element.getAttribute(this.attributeNames.search)
  }

  set search(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.search)
    } else {
      this.element.setAttribute(this.attributeNames.search, value)
    }
  }

  get value(): null | string {
    return this.selectedOption?.value ?? null
  }

  set value(value: null | string) {
    if (this.groups.length > 0) {
      this.setOption(
        this.groups
          .map((group) => {
            return group.options
          })
          .flat()
          .find((option) => {
            return option.value === value
          }),
      )
    } else {
      this.setOption(
        this.options.find((option) => {
          return option.value === value
        }),
      )
    }
  }

  #handleContentClickBound = this.#handleContentClick.bind(this)

  #handleContentKeydownBound = this.#handleContentKeydown.bind(this)

  #handleControlChangeBound = this.#handleControlChange.bind(this)

  #handleControlFocusBound = this.#handleControlFocus.bind(this)

  #handleEscapeBound = this.#handleEscape.bind(this)

  #handlePopoverClickBound = this.#handlePopoverClick.bind(this)

  #handleSearchInputBound = this.#handleSearchInput.bind(this)

  #handleSearchKeydownBound = this.#handleSearchKeydown.bind(this)

  #handleWindowClickBound = this.#handleWindowClick.bind(this)

  #tabTrap?: TabTrap

  close(): void {
    this.contentElement?.focus()
    escapeTrap.delete(this.#handleEscapeBound)
    this.popoverElement?.hidePopover()
    this.isExpanded = false
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.#connectElements()
    this.#connectTabTrap()
    this.#connectEventListeners()
    this.#parseOptions()
    this.render()
    this.update()
  }

  disconnect(): void {
    this.#disconnectEventListeners()
    this.#disconnectTabTrap()
    this.#disconnectElements()
  }

  moveActiveOptionBy(delta: number): boolean {
    const index = this.activeOption === undefined
      ? -1
      : this.visibleOptions.indexOf(this.activeOption)

    const newIndex = delta > 0
      ? Math.min(index + delta, this.visibleOptions.length - 1)
      : Math.max(index + delta, 0)

    let nearestIndex = this.#findNearestIndex(this.visibleOptions, newIndex, delta)

    if (nearestIndex === -1) {
      nearestIndex = this.#findNearestIndex(this.visibleOptions, newIndex, -delta)
    }

    if (nearestIndex > -1) {
      const activeOption = this.visibleOptions.at(nearestIndex)

      if (activeOption !== this.activeOption) {
        this.activeOption = activeOption
        this.#updateOptionElements()

        return true
      }
    }

    return false
  }

  moveActiveOptionTo(index: number): boolean {
    const currentIndex = this.activeOption === undefined
      ? -1
      : this.visibleOptions.indexOf(this.activeOption)

    let nearestIndex = this.#findNearestIndex(this.visibleOptions, index, index - currentIndex)

    if (nearestIndex === -1) {
      nearestIndex = this.#findNearestIndex(this.visibleOptions, index, currentIndex - index)
    }

    if (nearestIndex > -1) {
      const activeOption = this.visibleOptions.at(nearestIndex)

      if (activeOption !== this.activeOption) {
        this.activeOption = activeOption
        this.#updateOptionElements()

        return true
      }
    }

    return false
  }

  open(): void {
    this.popoverElement?.showPopover()
    this.isExpanded = true
    this.contentElement?.focus()
    this.searchElement?.focus()
    escapeTrap.add(this.#handleEscapeBound)
  }

  render(): void {
    this.#renderOptionElements()
  }

  setActiveOption(option?: SelectOption): void {
    this.activeOption = option
    this.#updateOptionElements()
  }

  setActiveOptionWith(predicate: (option: SelectOption) => boolean): void {
    let activeOption = this.visibleOptions.find(predicate)

    if (activeOption === undefined) {
      const nearestIndex = this.#findNearestIndex(this.visibleOptions, 0, 1)

      if (nearestIndex > -1) {
        activeOption = this.visibleOptions.at(nearestIndex)
      }
    }

    this.activeOption = activeOption
    this.#updateOptionElements()
  }

  setOption(option?: SelectOption): void {
    this.activeOption = option
    this.selectedOption = option
    this.update()
  }

  setSelectedOption(option?: SelectOption): void {
    this.selectedOption = option
    this.update()
  }

  toggle(): void {
    if (this.isExpanded) {
      this.close()
    } else {
      this.open()
    }
  }

  update(): void {
    this.#updateOptionElements()
    this.#updateControlElement()
    this.#updateContentElement()
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        delegatesFocus: true,
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${Select.style}</style>
        ${Select.template}
      `
    }

    this.buttonElement = this.element.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="button"]')
      ?.assignedElements()
      .at(0) as HTMLButtonElement | null | undefined ?? undefined

    const contentSlotElement = this.element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="content"]')

    this.contentElement =
      contentSlotElement?.assignedElements().at(0) as HTMLButtonElement | undefined ??
      contentSlotElement?.querySelector<HTMLButtonElement>('button') ??
      undefined

    this.contentElement?.setAttribute('aria-autocomplete', 'none')
    this.contentElement?.setAttribute('aria-expanded', 'false')
    this.contentElement?.setAttribute('aria-haspopup', 'listbox')
    this.contentElement?.setAttribute('role', 'combobox')

    const controlSlotElement = this.element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="control"]')

    this.controlElement =
      controlSlotElement?.assignedElements().at(0) as HTMLInputElement | null | undefined ??
      controlSlotElement?.querySelector<HTMLInputElement>('input') ??
      undefined

    this.controlElement?.setAttribute('aria-hidden', 'true')
    this.controlElement?.setAttribute('tabindex', '-1')
    this.popoverElement = this.element.shadowRoot?.querySelector<HTMLElement>('[part~="popover"]') ?? undefined

    this.searchElement = this.element.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="search"]')
      ?.assignedElements()
      .at(0) as HTMLInputElement | null | undefined ?? undefined

    this.searchElement?.setAttribute('aria-autocomplete', 'list')
    this.searchElement?.setAttribute('aria-expanded', 'false')
    this.searchElement?.setAttribute('aria-haspopup', 'listbox')
    this.searchElement?.setAttribute('role', 'combobox')
  }

  #connectEventListeners(): void {
    this.contentElement?.addEventListener('keydown', this.#handleContentKeydownBound)
    this.contentElement?.addEventListener('click', this.#handleContentClickBound)
    this.controlElement?.addEventListener('change', this.#handleControlChangeBound)
    this.controlElement?.addEventListener('focus', this.#handleControlFocusBound)
    this.searchElement?.addEventListener('input', this.#handleSearchInputBound)
    this.searchElement?.addEventListener('keydown', this.#handleSearchKeydownBound)
    this.popoverElement?.addEventListener('click', this.#handlePopoverClickBound)
    window.addEventListener('click', this.#handleWindowClickBound)
  }

  #connectTabTrap(): void {
    if (this.popoverElement !== undefined) {
      this.#tabTrap = new TabTrap(this.popoverElement)

      this.#tabTrap.add(
        this.searchElement,
        this.buttonElement,
      )

      this.#tabTrap.observe()
    }
  }

  #disconnectElements(): void {
    this.buttonElement = undefined
    this.contentElement = undefined
    this.controlElement = undefined
    this.popoverElement = undefined
    this.searchElement = undefined
  }

  #disconnectEventListeners(): void {
    this.contentElement?.removeEventListener('keydown', this.#handleContentKeydownBound)
    this.contentElement?.removeEventListener('click', this.#handleContentClickBound)
    this.controlElement?.removeEventListener('change', this.#handleControlChangeBound)
    this.controlElement?.removeEventListener('focus', this.#handleControlFocusBound)
    this.searchElement?.removeEventListener('input', this.#handleSearchInputBound)
    this.searchElement?.removeEventListener('keydown', this.#handleSearchKeydownBound)
    this.popoverElement?.removeEventListener('click', this.#handlePopoverClickBound)
    window.removeEventListener('click', this.#handleWindowClickBound)
  }

  #disconnectTabTrap(): void {
    this.#tabTrap?.disconnect()
    this.#tabTrap = undefined
  }

  #findNearestIndex(options: SelectOption[], index: number, direction: number): number {
    if (direction > 0) {
      for (let i = index; i < options.length; i += 1) {
        if (!(
          this.options[i].disabled ||
          this.options[i].group?.disabled === true
        )) {
          return i
        }
      }
    } else if (direction < 0) {
      for (let i = index; i >= 0; i -= 1) {
        if (!(
          this.options[i].disabled ||
          this.options[i].group?.disabled === true
        )) {
          return i
        }
      }
    }

    return -1
  }

  #handleContentClick(event: MouseEvent): void {
    event.stopPropagation()
    this.toggle()
  }

  #handleContentKeydown(event: KeyboardEvent): void {
    if (this.isExpanded) {
      this.#handleKeydown(event)
    } else if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown' ||
      event.code === 'Space' ||
      event.code === 'End' ||
      event.code === 'Home'
    ) {
      event.preventDefault()
      this.open()

      if (event.code === 'ArrowUp') {
        this.moveActiveOptionTo(0)
      } else if (event.code === 'End') {
        this.moveActiveOptionTo(this.visibleOptions.length - 1)
      } else if (event.code === 'Home') {
        this.moveActiveOptionTo(0)
      }
    }
  }

  #handleControlChange(): void {
    this.setActiveOptionWith((option) => option.value === this.controlElement?.value)
    this.setSelectedOption(this.activeOption)
  }

  #handleControlFocus(): void {
    this.contentElement?.focus()
  }

  #handleEscape(): void {
    this.close()
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (
      event.code === 'Enter' || (
        event.code === 'Space' &&
        this.searchElement === undefined
      ) || (
        event.code === 'Tab' &&
        this.buttonElement === undefined
      )
    ) {
      event.preventDefault()
      this.setSelectedOption(this.activeOption)
      this.close()
    } else if (
      event.code === 'ArrowDown' ||
      event.code === 'ArrowUp' ||
      event.code === 'End' ||
      event.code === 'Home' ||
      event.code === 'PageDown' ||
      event.code === 'PageUp'
    ) {
      event.preventDefault()

      switch (event.code) {
        case 'ArrowDown':
          this.moveActiveOptionBy(1)
          break
        case 'ArrowUp':
          if (event.altKey) {
            this.setSelectedOption(this.activeOption)
            this.close()
          } else {
            this.moveActiveOptionBy(-1)
          }

          break
        case 'End':
          this.moveActiveOptionTo(this.visibleOptions.length - 1)
          break
        case 'Home':
          this.moveActiveOptionTo(0)
          break
        case 'PageDown':
          this.moveActiveOptionBy(10)
          break
        case 'PageUp':
          this.moveActiveOptionBy(-10)
          break
        default:
          break
      }
    }
  }

  #handlePopoverClick(event: MouseEvent): void {
    const optionElement = event.target.closest<HTMLElement>('[role="option"]')

    if (optionElement !== null) {
      this.setActiveOptionWith((option) => option.value === optionElement.getAttribute(this.attributeNames.value))
      this.setSelectedOption(this.activeOption)
      this.close()
    }
  }

  #handleSearchInput(): void {
    if (this.search === '') {
      if (this.groups.length === 0) {
        this.visibleOptions = this.options.filter((option) => {
          return (option.label ?? option.textContent)
            .toLowerCase()
            .includes(this.searchElement?.value.toLowerCase() ?? '')
        })
      } else {
        this.visibleOptions = this.groups
          .map((group) => {
            return group.options
          })
          .flat()
          .filter((option) => {
            return (option.label ?? option.textContent)
              .toLowerCase()
              .includes(this.searchElement?.value.toLowerCase() ?? '')
          })
      }

      this.setActiveOptionWith((option) => option.value === this.activeOption?.value)
      this.render()
      this.update()
    }
  }

  #handleSearchKeydown(event: KeyboardEvent): void {
    this.#handleKeydown(event)
  }

  #handleWindowClick(event: MouseEvent): void {
    if (
      !this.element.contains(event.target) &&
      this.popoverElement?.contains(event.target) === false
    ) {
      this.close()
    }
  }

  #parseOptions(): void {
    const elements = Array.from(this.element.querySelectorAll<HTMLElement>(':scope > :not([slot])'))
    const firstElement = elements.at(0)

    const isGrouped =
      firstElement?.getAttribute('role') === 'group' ||
      (firstElement?.tagName.includes('OPTGROUP') ?? false)

    if (isGrouped) {
      this.groups = elements.map((groupElement) => {
        const group: SelectGroup = {
          disabled: groupElement.hasAttribute('disabled'),
          label: groupElement.querySelector<HTMLLegendElement>('legend')?.textContent ?? groupElement.getAttribute(this.attributeNames.label) ?? undefined,
          options: [],
          tagName: groupElement.tagName,
        }

        group.options = Array
          .from(groupElement.children)
          .filter((optionElement) => {
            return optionElement.tagName !== 'LEGEND'
          })
          .map((optionElement) => {
            return {
              disabled: optionElement.hasAttribute('disabled'),
              group,
              innerHTML: optionElement.innerHTML,
              label: optionElement.getAttribute(this.attributeNames.label) ?? undefined,
              selected: optionElement.hasAttribute(this.attributeNames.selected),
              tagName: optionElement.tagName,
              textContent: optionElement.textContent,
              value: optionElement.getAttribute(this.attributeNames.value) ?? optionElement.textContent,
            }
          })

        return group
      })

      this.visibleOptions = this.groups
        .map((group) => {
          return group.options
        })
        .flat()
    } else {
      this.options = elements.map((optionElement) => {
        return {
          disabled: optionElement.hasAttribute('disabled'),
          innerHTML: optionElement.innerHTML,
          label: optionElement.getAttribute(this.attributeNames.label) ?? undefined,
          selected: optionElement.hasAttribute(this.attributeNames.selected),
          tagName: optionElement.tagName,
          textContent: optionElement.textContent,
          value: optionElement.getAttribute(this.attributeNames.value) ?? optionElement.textContent,
        }
      })

      this.visibleOptions = [...this.options]
    }

    this.setActiveOptionWith((option) => option.selected)
    this.selectedOption = this.activeOption
  }

  #renderOptionElements(): void {
    const elements = Array.from(this.element.querySelectorAll<HTMLElement>(':scope > :not([slot])'))

    for (const element of elements) {
      element.remove()
    }

    if (this.groups.length === 0) {
      for (const option of this.options) {
        if (this.visibleOptions.includes(option)) {
          const optionElement = document.createElement(option.tagName ?? 'div')

          optionElement.setAttribute('role', 'option')
          optionElement.toggleAttribute(this.attributeNames.selected, option.selected)
          optionElement.setAttribute(this.attributeNames.value, option.value)

          if (option.disabled) {
            optionElement.setAttribute('aria-disabled', 'true')
            optionElement.toggleAttribute('disabled', true)
          }

          if (option.label !== undefined) {
            optionElement.setAttribute(this.attributeNames.label, option.label)
          }

          optionElement.setHTMLUnsafe(option.innerHTML ?? option.textContent)
          this.element.appendChild(optionElement)
        }
      }
    } else {
      for (const group of this.groups) {
        const groupElement = document.createElement(group.tagName ?? 'div')

        groupElement.setAttribute('role', 'group')

        if (group.disabled) {
          groupElement.setAttribute('aria-disabled', 'true')
          groupElement.toggleAttribute('disabled', true)
        }

        if (group.label !== undefined) {
          const labelElement = document.createElement('legend')

          labelElement.setAttribute('slot', 'label')
          labelElement.textContent = group.label
          groupElement.ariaLabelledByElements = [labelElement]
          groupElement.appendChild(labelElement)
        }

        for (const option of group.options) {
          if (this.visibleOptions.includes(option)) {
            const optionElement = document.createElement(option.tagName ?? 'div')

            optionElement.setAttribute('role', 'option')
            optionElement.toggleAttribute(this.attributeNames.selected, option.selected)
            optionElement.setAttribute(this.attributeNames.value, option.value)

            if (option.disabled) {
              optionElement.setAttribute('aria-disabled', 'true')
              optionElement.toggleAttribute('disabled', true)
            }

            if (option.label !== undefined) {
              optionElement.setAttribute(this.attributeNames.label, option.label)
            }

            optionElement.setHTMLUnsafe(option.innerHTML ?? option.textContent)
            groupElement.appendChild(optionElement)
          }
        }

        if (groupElement.querySelector<HTMLElement>('[role="option"]') !== null) {
          this.element.appendChild(groupElement)
        }
      }
    }

    this.element.toggleAttribute(this.attributeNames.empty, this.visibleOptions.length === 0)
  }

  #updateContentElement(): void {
    if (this.contentElement !== undefined) {
      this.contentElement.setHTMLUnsafe(this.selectedOption?.innerHTML ?? this.selectedOption?.textContent ?? '')
    }
  }

  #updateControlElement(): void {
    if (this.controlElement !== undefined) {
      const value = this.selectedOption?.value ?? ''
      const hasChanged = this.controlElement.value !== value

      this.controlElement.value = value

      if (hasChanged) {
        this.controlElement.dispatchEvent(new Event('change', {
          bubbles: true,
        }))
      }
    }
  }

  #updateOptionElements(): void {
    for (const optionElement of this.optionElements) {
      if (optionElement.getAttribute(this.attributeNames.value) === this.activeOption?.value) {
        if (this.contentElement !== undefined) {
          this.contentElement.ariaActiveDescendantElement = optionElement
        }

        if (this.searchElement !== undefined) {
          this.searchElement.ariaActiveDescendantElement = optionElement
        }

        optionElement.toggleAttribute(this.attributeNames.active, true)

        const optionRect = optionElement.getBoundingClientRect()
        const slotRect = optionElement.assignedSlot?.getBoundingClientRect() ?? optionRect

        if (
          optionRect.top < slotRect.top ||
          optionRect.bottom > slotRect.bottom
        ) {
          optionElement.scrollIntoView({
            block: 'nearest',
          })
        }
      } else {
        optionElement.toggleAttribute(this.attributeNames.active, false)
      }

      if (optionElement.getAttribute(this.attributeNames.value) === this.selectedOption?.value) {
        optionElement.setAttribute('aria-selected', 'true')
        optionElement.toggleAttribute(this.attributeNames.selected, true)
      } else {
        optionElement.removeAttribute('aria-selected')
        optionElement.toggleAttribute(this.attributeNames.selected, false)
      }
    }
  }
}
