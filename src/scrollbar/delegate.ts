import type { Delegate } from '../delegator/index.js'
import { type MoveEvent, MoveObserver } from '../observer/index.js'
import style from './style.css'
import template from './template.html'

export class Scrollbar implements Delegate {
  static attributeNames = {
    active: 'data-active',
    axis: 'data-axis',
    minSize: 'data-min-size',
    noOverflow: 'data-no-overflow',
  }

  static defaultAxis = 'y'

  static defaultMinSize = '32'

  static name = 'scrollbar'

  static style = style

  static template = template

  attributeNames = Scrollbar.attributeNames

  element!: HTMLElement

  get axis(): string {
    return (
      this.element.getAttribute(this.attributeNames.axis) ??
      Scrollbar.defaultAxis
    )
  }

  set axis(value: null | string) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.axis)
    } else {
      this.element.setAttribute(this.attributeNames.axis, value)
    }
  }

  get minSize(): number {
    return Number(
      this.element.getAttribute(this.attributeNames.minSize) ??
      Scrollbar.defaultMinSize,
    )
  }

  set minSize(value: null | number) {
    if (value === null) {
      this.element.removeAttribute(this.attributeNames.minSize)
    } else {
      this.element.setAttribute(this.attributeNames.minSize, value.toString())
    }
  }

  #handleMoveXBound = this.#handleMoveX.bind(this)

  #handleMoveYBound = this.#handleMoveY.bind(this)

  #handleMutationBound = this.#handleMutation.bind(this)

  #handlePointerdownXBound = this.#handlePointerdownX.bind(this)

  #handlePointerdownYBound = this.#handlePointerdownY.bind(this)

  #handlePointerupBound = this.#handlePointerup.bind(this)

  #handleResizeXBound = this.#handleResizeX.bind(this)

  #handleResizeYBound = this.#handleResizeY.bind(this)

  #handleScrollXBound = this.#handleScrollX.bind(this)

  #handleScrollYBound = this.#handleScrollY.bind(this)

  #handleWheelBound = this.#handleWheel.bind(this)

  #initialValues = {
    scrollLeft: 0,
    scrollTop: 0,
    t0: 0,
  }

  #moveObserver?: MoveObserver

  #mutationObserver?: MutationObserver

  #resizeObserver?: ResizeObserver

  #targetElement!: HTMLElement

  #thumbElement!: HTMLElement

  connect(element: HTMLElement): void {
    this.element = element

    if ('onmousemove' in window) {
      this.#connectElements()
      this.#connectMoveObserver()
      this.#connectResizeObserver()
      this.#connectMutationObserver()
      this.#connectEventListeners()
      this.#handleMutation()
    } else {
      this.element.style.setProperty('display', 'none')
    }
  }

  disconnect(): void {
    if ('onmousemove' in window) {
      this.#disconnectEventListeners()
      this.#disconnectMutationObserver()
      this.#disconnectResizeObserver()
      this.#disconnectMoveObserver()
      this.#disconnectElements()
    } else {
      this.element.style.removeProperty('display')
    }
  }

  #connectElements(): void {
    if (this.element.shadowRoot === null) {
      const shadowRoot = this.element.attachShadow({
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${Scrollbar.style}</style>
        ${Scrollbar.template}
      `
    }

    const targetElement = this.element.hasAttribute('aria-controls')
      ? document.getElementById(this.element.getAttribute('aria-controls') ?? '') ?? undefined
      : this.element.parentElement?.firstElementChild as HTMLElement | null | undefined ?? undefined

    if (targetElement === undefined) {
      throw new Error('Target is undefined')
    }

    this.#targetElement = targetElement
    this.#targetElement.style.setProperty('height', '100%')
    this.#targetElement.style.setProperty(`overflow-${this.axis}`, 'auto')
    this.#targetElement.style.setProperty('scrollbar-width', 'none')
    this.#targetElement.style.setProperty('width', '100%')

    const thumbElement = this.element.shadowRoot?.querySelector<HTMLElement>('[part~="thumb"]') ?? undefined

    if (thumbElement === undefined) {
      throw new Error('Thumb is undefined')
    }

    this.#thumbElement = thumbElement
  }

  #connectEventListeners(): void {
    if (this.axis === 'x') {
      this.element.addEventListener('pointerdown', this.#handlePointerdownXBound)
      this.#targetElement.addEventListener('scroll', this.#handleScrollXBound)
    } else {
      this.element.addEventListener('pointerdown', this.#handlePointerdownYBound)
      this.#targetElement.addEventListener('scroll', this.#handleScrollYBound)
    }

    this.element.addEventListener('wheel', this.#handleWheelBound)
    this.#targetElement.addEventListener('wheel', this.#handleWheelBound)
  }

  #connectMoveObserver(): void {
    if (this.axis === 'x') {
      this.#moveObserver = new MoveObserver(this.#handleMoveXBound)
    } else {
      this.#moveObserver = new MoveObserver(this.#handleMoveYBound)
    }

    this.#moveObserver.observe(this.#thumbElement, this.element)
  }

  #connectMutationObserver(): void {
    this.#mutationObserver = new MutationObserver(this.#handleMutationBound)

    this.#mutationObserver.observe(this.#targetElement, {
      childList: true,
    })
  }

  #connectResizeObserver(): void {
    if (this.axis === 'x') {
      this.#resizeObserver = new ResizeObserver(this.#handleResizeXBound)
    } else {
      this.#resizeObserver = new ResizeObserver(this.#handleResizeYBound)
    }
  }

  #disconnectElements(): void {
    this.#targetElement.style.removeProperty('height')
    this.#targetElement.style.removeProperty(`overflow-${this.axis}`)
    this.#targetElement.style.removeProperty('scrollbar-width')
    this.#targetElement.style.removeProperty('width')
  }

  #disconnectEventListeners(): void {
    if (this.axis === 'x') {
      this.element.removeEventListener('pointerdown', this.#handlePointerdownXBound)
      this.#targetElement.removeEventListener('scroll', this.#handleScrollXBound)
    } else {
      this.element.removeEventListener('pointerdown', this.#handlePointerdownYBound)
      this.#targetElement.removeEventListener('scroll', this.#handleScrollYBound)
    }

    this.element.removeEventListener('wheel', this.#handleWheelBound)
    this.#targetElement.removeEventListener('wheel', this.#handleWheelBound)
  }

  #disconnectMoveObserver(): void {
    this.#moveObserver?.disconnect()
  }

  #disconnectMutationObserver(): void {
    this.#mutationObserver?.disconnect()
  }

  #disconnectResizeObserver(): void {
    this.#resizeObserver?.disconnect()
  }

  #handleMoveX(event: MoveEvent): void {
    this.#setInitialValues(event)
    this.#updateScrollX(event)
  }

  #handleMoveY(event: MoveEvent): void {
    this.#setInitialValues(event)
    this.#updateScrollY(event)
  }

  #handleMutation(): void {
    this.#resizeObserver?.disconnect()
    this.#resizeObserver?.observe(this.#targetElement)

    Array
      .from(this.#targetElement.children)
      .forEach((element) => {
        this.#resizeObserver?.observe(element)
      })
  }

  #handlePointerdownX(event: MouseEvent): void {
    this.element.toggleAttribute(this.attributeNames.active, true)
    window.addEventListener('pointerup', this.#handlePointerupBound)

    const thumbElementRect = this.#thumbElement.getBoundingClientRect()

    if (
      event.clientX < thumbElementRect.left ||
      event.clientX > thumbElementRect.right ||
      event.clientY < thumbElementRect.top ||
      event.clientY > thumbElementRect.bottom
    ) {
      this.#updateThumbX(event)
    }
  }

  #handlePointerdownY(event: MouseEvent): void {
    this.element.toggleAttribute(this.attributeNames.active, true)
    window.addEventListener('pointerup', this.#handlePointerupBound)

    const thumbElementRect = this.#thumbElement.getBoundingClientRect()

    if (
      event.clientX < thumbElementRect.left ||
      event.clientX > thumbElementRect.right ||
      event.clientY < thumbElementRect.top ||
      event.clientY > thumbElementRect.bottom
    ) {
      this.#updateThumbY(event)
    }
  }

  #handlePointerup(): void {
    this.element.toggleAttribute(this.attributeNames.active, false)
    window.removeEventListener('pointerup', this.#handlePointerupBound)
  }

  #handleResizeX(): void {
    this.#updateDimensionX()
    this.#updatePositionX()
  }

  #handleResizeY(): void {
    this.#updateDimensionY()
    this.#updatePositionY()
  }

  #handleScrollX(): void {
    this.#updatePositionX()
  }

  #handleScrollY(): void {
    this.#updatePositionY()
  }

  #handleWheel(event: WheelEvent): void {
    if (
      this.#targetElement.scrollWidth > this.#targetElement.offsetWidth &&
      this.#targetElement.scrollHeight === this.#targetElement.offsetHeight &&
      event.deltaX === 0 &&
      event.deltaY !== 0
    ) {
      event.preventDefault()
      this.#targetElement.scrollLeft += event.deltaY / 3
    } else if (event.target === this.element) {
      event.preventDefault()

      this.#targetElement.scrollTo({
        left: this.#targetElement.scrollLeft + event.deltaX,
        top: this.#targetElement.scrollTop + event.deltaY,
      })
    }
  }

  #setInitialValues(event: MoveEvent): void {
    if (event.t0 !== this.#initialValues.t0) {
      this.#initialValues = {
        scrollLeft: this.#targetElement.scrollLeft,
        scrollTop: this.#targetElement.scrollTop,
        t0: event.t0,
      }
    }
  }

  #updateDimensionX(): void {
    const fraction = this.#targetElement.offsetWidth / this.#targetElement.scrollWidth
    const elementStyle = window.getComputedStyle(this.element)
    const insetInlineTotal = parseInt(elementStyle.insetInlineStart, 10) + parseInt(elementStyle.insetInlineEnd, 10)

    if (
      fraction === 1 ||
      (this.#targetElement.offsetWidth - insetInlineTotal) < this.minSize
    ) {
      this.element.toggleAttribute(this.attributeNames.noOverflow, true)
    } else {
      this.element.toggleAttribute(this.attributeNames.noOverflow, false)
      this.#thumbElement.style.setProperty('width', `${Math.round(Math.max(this.minSize, fraction * this.element.offsetWidth))}px`)
    }
  }

  #updateDimensionY(): void {
    const fraction = this.#targetElement.offsetHeight / this.#targetElement.scrollHeight
    const elementStyle = window.getComputedStyle(this.element)
    const insetBlockTotal = parseInt(elementStyle.insetBlockStart, 10) + parseInt(elementStyle.insetBlockEnd, 10)

    if (
      fraction === 1 ||
      (this.#targetElement.offsetHeight - insetBlockTotal) < this.minSize
    ) {
      this.element.toggleAttribute(this.attributeNames.noOverflow, true)
    } else {
      this.element.toggleAttribute(this.attributeNames.noOverflow, false)
      this.#thumbElement.style.setProperty('height', `${Math.round(Math.max(this.minSize, fraction * this.element.offsetHeight))}px`)
    }
  }

  #updatePositionX(): void {
    const fraction = (this.#targetElement.scrollLeft / (this.#targetElement.scrollWidth - this.#targetElement.offsetWidth))
    const range = this.element.offsetWidth - this.#thumbElement.offsetWidth

    this.#thumbElement.style.setProperty('left', `${fraction * range}px`)
  }

  #updatePositionY(): void {
    const fraction = (this.#targetElement.scrollTop / (this.#targetElement.scrollHeight - this.#targetElement.offsetHeight))
    const range = this.element.offsetHeight - this.#thumbElement.offsetHeight

    this.#thumbElement.style.setProperty('top', `${fraction * range}px`)
  }

  #updateScrollX(event: MoveEvent): void {
    const pointerDistance = event.clientX - event.clientX0
    const targetRange = this.#targetElement.scrollWidth - this.#targetElement.offsetWidth
    const thumbRange = this.element.offsetWidth - this.#thumbElement.offsetWidth

    this.#targetElement.scrollLeft = this.#initialValues.scrollLeft + ((pointerDistance / thumbRange) * targetRange)
  }

  #updateScrollY(event: MoveEvent): void {
    const pointerDistance = event.clientY - event.clientY0
    const targetRange = this.#targetElement.scrollHeight - this.#targetElement.offsetHeight
    const thumbRange = this.element.offsetHeight - this.#thumbElement.offsetHeight

    this.#targetElement.scrollTop = this.#initialValues.scrollTop + ((pointerDistance / thumbRange) * targetRange)
  }

  #updateThumbX(event: MouseEvent): void {
    const {
      left, right,
    } = this.element.getBoundingClientRect()

    const targetRange = this.#targetElement.scrollWidth - this.#targetElement.offsetWidth
    const thumbPosition = event.clientX - left - (this.#thumbElement.offsetWidth / 2)
    const thumbRange = right - left - this.#thumbElement.offsetWidth

    this.#targetElement.scrollLeft = (thumbPosition / thumbRange) * targetRange
  }

  #updateThumbY(event: MouseEvent): void {
    const {
      bottom, top,
    } = this.element.getBoundingClientRect()

    const targetRange = this.#targetElement.scrollHeight - this.#targetElement.offsetHeight
    const thumbPosition = event.clientY - top - (this.#thumbElement.offsetHeight / 2)
    const thumbRange = bottom - top - this.#thumbElement.offsetHeight

    this.#targetElement.scrollTop = (thumbPosition / thumbRange) * targetRange
  }
}
