import type { CommandableElement } from '../elements/commandable.js'
import { Command } from '../helpers/command.js'

export interface ElementToggleFlexCommandOptions {
  immediate?: string
}

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
