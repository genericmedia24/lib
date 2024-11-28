import type { CommandableElement } from '../commander/commandable-element.js'
import { Command } from '../commander/command.js'

export interface ElementToggleFlexCommandOptions {
  /**
   * Whether to toggle the flex immediately.
   */
  immediate?: string
}

/**
 * Toggles the CSS `flex` property of an element.
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
 * See [a live example](../../examples/commands.html#element-toggle-flex) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-toggle-flex.html}
 */
export class ElementToggleFlexCommand extends Command<CommandableElement, ElementToggleFlexCommandOptions> {
  public execute(): void {
    const immediate = this.options.immediate === 'true'

    if (this.targetElement.hasAttribute('hidden')) {
      if (immediate) {
        this.targetElement.style.setProperty('display', 'none')
        this.targetElement.style.setProperty('flex', '0')
        this.targetElement.commander.execute('hidden')
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty('flex', '1')

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
          this.targetElement.style.setProperty('flex', '0')
        })
      }
    } else {
      this.targetElement.style.removeProperty('display')
      this.targetElement.commander.execute('visible')

      if (immediate) {
        this.targetElement.style.removeProperty('flex')
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty('flex', '0')

        const end = (): void => {
          this.targetElement.ontransitioncancel = null
          this.targetElement.ontransitionend = null
          this.targetElement.style.removeProperty('flex')
        }

        this.targetElement.ontransitioncancel = end
        this.targetElement.ontransitionend = end

        window.setTimeout(() => {
          this.targetElement.style.removeProperty('transition-property')
          this.targetElement.style.setProperty('flex', '1')
        })
      }
    }
  }
}
