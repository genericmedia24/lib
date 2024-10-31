import type { UpdatableElement } from '../elements/updatable.js'
import { Command } from '../helpers/command.js'

export interface ElementUpdateCommandOptions extends Record<string, unknown> {
  'immediate'?: string
  'when-visible'?: string
}

export class ElementUpdateCommand extends Command<UpdatableElement> {
  public async execute(options?: ElementUpdateCommandOptions): Promise<void> {
    if (
      options?.['when-visible'] !== undefined &&
      !this.targetElement.checkVisibility()
    ) {
      return
    }

    if (options?.immediate === 'false') {
      await new Promise<void>((resolve, reject) => {
        window.requestAnimationFrame(() => {
          Promise
            .resolve()
            .then(async () => {
              await this.targetElement.update(options)
              resolve()
            })
            .catch((error: unknown) => {
              reject(error as Error)
            })
        })
      })
    } else {
      await this.targetElement.update(options)
    }
  }
}
