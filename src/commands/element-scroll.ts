import type { Element } from '../elements/element.js'
import type { ScrollbarElement } from '../elements/scrollbar.js'
import { Command } from '../helpers/command.js'

export interface ElementScrollCommandData {
  event?: Interact.InteractEvent | MouseEvent
}

export interface ElementScrollCommandOptions {
  axis?: 'x' | 'y'
  update?: string
}

export class ElementScrollCommand extends Command<Element, ElementScrollCommandOptions, ScrollbarElement> {
  public initialValues = {
    scrollLeft: 0,
    scrollTop: 0,
    t0: 0,
  }

  public popoverElements?: HTMLElement[]

  public override execute(data?: ElementScrollCommandData): void {
    if (data !== undefined) {
      if (this.options.axis === 'y') {
        this.updateY(data)
      } else {
        this.updateX(data)
      }
    }
  }

  protected hidePopoverElements(): void {
    this.popoverElements ??= Array.from(this.targetElement.querySelectorAll('[popover]'))

    this.popoverElements.forEach((element) => {
      element.hidePopover()
    })
  }

  protected setInitialValues(event: Interact.InteractEvent): void {
    if (event.t0 !== this.initialValues.t0) {
      this.initialValues = {
        scrollLeft: this.targetElement.scrollLeft,
        scrollTop: this.targetElement.scrollTop,
        t0: event.t0,
      }
    }
  }

  protected updateX(data: ElementScrollCommandData): void {
    if (this.options.update === undefined) {
      if (
        data.event !== undefined &&
        !(data.event instanceof MouseEvent)
      ) {
        this.setInitialValues(data.event)
        this.updateXScroll(data.event)
      }
    } else {
      if (this.options.update.includes('dimension')) {
        this.updateXDimension()
      }

      if (this.options.update.includes('popover')) {
        this.hidePopoverElements()
      }

      if (this.options.update.includes('position')) {
        this.updateXPosition()
      }

      if (this.options.update.includes('thumb')) {
        if (
          data.event instanceof MouseEvent &&
          data.event.target !== this.originElement.thumbElement
        ) {
          this.updateXThumb(data.event)
        }
      }
    }
  }

  protected updateXDimension(): void {
    const fraction = this.targetElement.offsetWidth / this.targetElement.scrollWidth
    const minSize = Number(this.originElement.dataset.minSize ?? 28)
    const style = window.getComputedStyle(this.originElement)
    const insetInlineTotal = parseInt(style.insetInlineStart, 10) + parseInt(style.insetInlineEnd, 10)

    if (
      fraction === 1 ||
      (this.targetElement.offsetWidth - insetInlineTotal) < minSize
    ) {
      this.originElement.classList.toggle('no-overflow', true)
    } else {
      this.originElement.classList.toggle('no-overflow', false)
      this.originElement.thumbElement.style.setProperty('width', `${Math.max(minSize, fraction * this.originElement.offsetWidth)}px`)
    }
  }

  protected updateXPosition(): void {
    const fraction = (this.targetElement.scrollLeft / (this.targetElement.scrollWidth - this.targetElement.offsetWidth))
    const range = this.originElement.offsetWidth - this.originElement.thumbElement.offsetWidth
    this.originElement.thumbElement.style.setProperty('left', `${fraction * range}px`)
  }

  protected updateXScroll(event: Interact.InteractEvent): void {
    const pointerDistance = event.clientX - event.clientX0
    const targetRange = this.targetElement.scrollWidth - this.targetElement.offsetWidth
    const thumbRange = this.originElement.offsetWidth - this.originElement.thumbElement.offsetWidth
    this.targetElement.scrollLeft = this.initialValues.scrollLeft + ((pointerDistance / thumbRange) * targetRange)
  }

  protected updateXThumb(event: MouseEvent): void {
    const { left, right } = this.originElement.getBoundingClientRect()
    const targetRange = this.targetElement.scrollWidth - this.targetElement.offsetWidth
    const thumbPosition = event.clientX - left - (this.originElement.thumbElement.offsetWidth / 2)
    const thumbRange = right - left - this.originElement.thumbElement.offsetWidth
    this.targetElement.scrollLeft = (thumbPosition / thumbRange) * targetRange
  }

  protected updateY(data: ElementScrollCommandData): void {
    if (this.options.update === undefined) {
      if (
        data.event !== undefined &&
        !(data.event instanceof MouseEvent)
      ) {
        this.setInitialValues(data.event)
        this.updateYScroll(data.event)
      }
    } else {
      if (this.options.update.includes('dimension')) {
        this.updateYDimension()
      }

      if (this.options.update.includes('popover')) {
        this.hidePopoverElements()
      }

      if (this.options.update.includes('position')) {
        this.updateYPosition()
      }

      if (this.options.update.includes('thumb')) {
        if (
          data.event instanceof MouseEvent &&
          data.event.target !== this.originElement.thumbElement
        ) {
          this.updateYThumb(data.event)
        }
      }
    }
  }

  protected updateYDimension(): void {
    const fraction = this.targetElement.offsetHeight / this.targetElement.scrollHeight
    const minSize = Number(this.originElement.dataset.minSize ?? 28)
    const style = window.getComputedStyle(this.originElement)
    const insetBlockTotal = parseInt(style.insetBlockStart, 10) + parseInt(style.insetBlockEnd, 10)

    if (
      fraction === 1 ||
      (this.targetElement.offsetHeight - insetBlockTotal) < minSize
    ) {
      this.originElement.classList.toggle('no-overflow', true)
    } else {
      this.originElement.classList.toggle('no-overflow', false)
      this.originElement.thumbElement.style.setProperty('height', `${Math.max(minSize, fraction * this.originElement.offsetHeight)}px`)
    }
  }

  protected updateYPosition(): void {
    const fraction = (this.targetElement.scrollTop / (this.targetElement.scrollHeight - this.targetElement.offsetHeight))
    const range = this.originElement.offsetHeight - this.originElement.thumbElement.offsetHeight
    this.originElement.thumbElement.style.setProperty('top', `${fraction * range}px`)
  }

  protected updateYScroll(event: Interact.InteractEvent): void {
    const pointerDistance = event.clientY - event.clientY0
    const targetRange = this.targetElement.scrollHeight - this.targetElement.offsetHeight
    const thumbRange = this.originElement.offsetHeight - this.originElement.thumbElement.offsetHeight
    this.targetElement.scrollTop = this.initialValues.scrollTop + ((pointerDistance / thumbRange) * targetRange)
  }

  protected updateYThumb(event: MouseEvent): void {
    const { bottom, top } = this.originElement.getBoundingClientRect()
    const targetRange = this.targetElement.scrollHeight - this.targetElement.offsetHeight
    const thumbPosition = event.clientY - top - (this.originElement.thumbElement.offsetHeight / 2)
    const thumbRange = bottom - top - this.originElement.thumbElement.offsetHeight
    this.targetElement.scrollTop = (thumbPosition / thumbRange) * targetRange
  }
}
