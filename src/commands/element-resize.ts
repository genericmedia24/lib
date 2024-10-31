import type { Element } from '../elements/element.js'
import type { ResizerElement } from '../elements/resizer.js'
import { Command } from '../helpers/command.js'

export interface ElementResizeCommandOptions {
  auto?: string
  axis?: 'x' | 'y'
  event: Interact.InteractEvent
}

export class ElementResizeCommand extends Command<Element, ElementResizeCommandOptions, ResizerElement> {
  public initialValues = {
    height: 0,
    t0: 0,
    width: 0,
  }

  public override execute(options: ElementResizeCommandOptions): void {
    if (this.originElement === this.targetElement) {
      this.initialize()
    } else {
      this.setInitialValues(options.event)

      if (options.axis === 'y') {
        this.resizeY(options)
      } else {
        this.resizeX(options)
      }
    }
  }

  protected initialize(): void {
    const state = this.targetElement.state?.getAll()

    if (typeof state?.height === 'number') {
      this.targetElement.style.setProperty('height', `${state.height}px`)
    }

    if (typeof state?.width === 'number') {
      this.targetElement.style.setProperty('width', `${state.width}px`)
    }
  }

  protected resizeX(options: ElementResizeCommandOptions): void {
    if (options.auto === undefined) {
      const distance = options.event.clientX - options.event.clientX0
      const width = this.initialValues.width + distance
      this.targetElement.state?.set('width', width)
      this.targetElement.style.setProperty('width', `${width}px`)
    } else {
      this.targetElement.state?.delete('width')
      this.targetElement.style.removeProperty('width')
    }
  }

  protected resizeY(options: ElementResizeCommandOptions): void {
    if (options.auto === undefined) {
      const distance = options.event.clientY - options.event.clientY0
      const height = this.initialValues.height + distance
      this.targetElement.state?.set('height', height)
      this.targetElement.style.setProperty('height', `${height}px`)
    } else {
      this.targetElement.state?.delete('height')
      this.targetElement.style.removeProperty('height')
    }
  }

  protected setInitialValues(event: Interact.InteractEvent): void {
    if (event.t0 !== this.initialValues.t0) {
      const rect = this.targetElement.getBoundingClientRect()

      this.initialValues = {
        height: rect.height,
        t0: event.t0,
        width: rect.width,
      }
    }
  }
}
