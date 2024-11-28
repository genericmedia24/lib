import type { Element } from '../elements/element.js'
import { Command } from '../commander/command.js'

export interface ElementToggleMarginCommandOptions {
  /**
   * Whether to toggle the margin immediately.
   */
  immediate?: string

  /**
   * The position of the element. Can be `start` or `end`, defaults to `start`.
   */
  position?: string
}

/**
 * Toggles the CSS `margin-inline` property of an element.
*
 * The position of the element is determined by {@link ElementToggleMarginCommandOptions.position | options.position}.
 *
 * Ensures that the transition is performed correctly so that the element will not flash when the document is loaded.
 *
 * If {@link ElementToggleMarginCommandOptions.immediate | options.immediate} is defined no transition will be performed.
 *
 * Uses the `hidden` attribute to determine whether the element should be hidden or shown.
 *
 * Executes a `hidden` command after the element is hidden and a `visible` command before it is shown.
 *
 * @example
 * See [a live example](../../examples/commands.html#element-toggle-margin) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-toggle-margin.html}
 */
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

      const { width } = this.targetElement.getBoundingClientRect()

      if (width === 0) {
        // do nothing
      } else if (immediate) {
        this.targetElement.style.removeProperty(property)
      } else {
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
      }
    }
  }
}
