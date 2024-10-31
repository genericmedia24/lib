import type { CommandableElement } from '../elements/commandable.js'
import { Command } from '../helpers/command.js'

export interface ElementToggleHeightCommandOptions {
  immediate?: string
}

export class ElementToggleHeightCommand extends Command<CommandableElement, ElementToggleHeightCommandOptions> {
  public execute(options: ElementToggleHeightCommandOptions): void {
    const immediate = options.immediate === 'true'

    if (this.targetElement.hasAttribute('hidden')) {
      if (immediate) {
        this.targetElement.style.setProperty('display', 'none')
        this.targetElement.style.setProperty('height', '0px')
        this.targetElement.commander.execute('hidden')
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty('height', `${this.targetElement.scrollHeight}px`)

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
          this.targetElement.style.setProperty('height', '0px')
        })
      }
    } else {
      this.targetElement.style.removeProperty('display')
      this.targetElement.commander.execute('visible')

      if (immediate) {
        this.targetElement.style.removeProperty('height')
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty('height', '0px')

        const end = (): void => {
          this.targetElement.ontransitioncancel = null
          this.targetElement.ontransitionend = null
          this.targetElement.style.removeProperty('height')
        }

        this.targetElement.ontransitioncancel = end
        this.targetElement.ontransitionend = end

        window.setTimeout(() => {
          this.targetElement.style.removeProperty('transition-property')
          this.targetElement.style.setProperty('height', `${this.targetElement.scrollHeight}px`)
        })
      }
    }
  }
}
