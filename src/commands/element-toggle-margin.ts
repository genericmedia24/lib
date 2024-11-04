import type { Element } from '../elements/element.js'
import { Command } from '../helpers/command.js'

export interface ElementToggleMarginCommandOptions {
  immediate?: string
  position?: string
}

export class ElementToggleMarginCommand extends Command<Element, ElementToggleMarginCommandOptions> {
  public async execute(): Promise<void> {
    if (this.targetElement.state?.storage === 'idb') {
      await this.targetElement.state.loaded
    }

    const immediate = this.options.immediate === 'true'

    const property = this.options.position === undefined
      ? 'margin-inline-start'
      : `margin-inline-${this.options.position}`

    if (this.targetElement.hasAttribute('hidden')) {
      const { width } = this.targetElement.getBoundingClientRect()

      if (width === 0) {
        this.targetElement.commander.execute('hidden')
      } else if (immediate) {
        this.targetElement.style.setProperty('display', 'none')
        this.targetElement.style.setProperty(property, `-${width}px`)
        this.targetElement.commander.execute('hidden')
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty(property, '0px')

        const end = (): void => {
          this.targetElement.ontransitioncancel = null
          this.targetElement.ontransitionend = null
          this.targetElement.style.setProperty('display', 'none')
          this.targetElement.commander.execute('hidden')
        }

        this.targetElement.ontransitioncancel = end
        this.targetElement.ontransitionend = end

        window.setTimeout(() => {
          this.targetElement.style.removeProperty('transition-property')
          this.targetElement.style.setProperty(property, `-${width}px`)
        })
      }
    } else {
      this.targetElement.style.removeProperty('display')
      this.targetElement.commander.execute('visible')

      const currentValue = window
        .getComputedStyle(this.targetElement)
        .getPropertyValue(property)

      const { width } = this.targetElement.getBoundingClientRect()

      if (width === 0) {
        // do nothing
      } else if (immediate) {
        this.targetElement.style.removeProperty(property)
      } else if (currentValue !== '0px') {
        window.setTimeout(() => {
          this.targetElement.style.setProperty('transition-property', 'none')
          this.targetElement.style.setProperty(property, `-${width}px`)

          const end = (): void => {
            this.targetElement.ontransitioncancel = null
            this.targetElement.ontransitionend = null
            this.targetElement.style.removeProperty(property)
          }

          this.targetElement.ontransitioncancel = end
          this.targetElement.ontransitionend = end

          window.setTimeout(() => {
            this.targetElement.style.removeProperty('transition-property')
            this.targetElement.style.setProperty(property, '0px')
          })
        })
      }
    }
  }
}
