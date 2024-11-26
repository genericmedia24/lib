import type { UpdatableElement } from '../commander/updatable-element.js'
import { Command } from '../commander/command.js'

export interface ElementUpdateCommandOptions {
  'immediate'?: string
  'when-visible'?: string
}

export class ElementUpdateCommand extends Command<UpdatableElement, ElementUpdateCommandOptions> {
  public async execute(data?: Record<string, unknown>): Promise<void> {
    if (
      this.options['when-visible'] !== undefined &&
      !this.targetElement.checkVisibility()
    ) {
      return
    }

    if (this.options.immediate === 'false') {
      await new Promise<void>((resolve, reject) => {
        window.requestAnimationFrame(() => {
          Promise
            .resolve()
            .then(async () => {
              await this.targetElement.update(data)
              resolve()
            })
            .catch((error: unknown) => {
              reject(error)
            })
        })
      })
    } else {
      await this.targetElement.update(data)
    }
  }
}
