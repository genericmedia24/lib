import type { UpdatableElement } from '../commander/updatable-element.js'
import { Command } from '../commander/command.js'

export interface ElementUpdateCommandOptions extends Record<string, unknown> {
  'immediate'?: string
  'when-visible'?: string
}

/**
 * Updates an element.
 *
 * Calls `update` on the element with one argument: the merged object of {@link options} and the data passed to {@link execute}.
 *
 * If options{@link ElementUpdateCommandOptions['when-visible']} is defined the element will only be updated if {@link targetElement}.[checkVisibility](https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility) returns `true`.
 *
 * If {@link ElementUpdateCommandOptions.immediate | options.immediate} is defined the element is updated immediately.
 *
 * Otherwise the update is wrapped in a [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
 *
 * @example
 * See [a live example](../../examples/commands.html#element-update) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-update.html}
 */
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
              await this.targetElement.update({
                ...this.options,
                ...data,
              })

              resolve()
            })
            .catch((error: unknown) => {
              reject(error)
            })
        })
      })
    } else {
      await this.targetElement.update({
        ...this.options,
        ...data,
      })
    }
  }
}
