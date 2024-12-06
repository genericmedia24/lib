import type { UpdatableElement } from '../commander/updatable-element.js'
import { Command } from '../commander/command.js'

export interface ElementUpdateCommandOptions extends Record<string, unknown> {
  'immediate'?: string
  'when-visible'?: string
}

/**
 * Updates an element.
 *
 * Calls `targetElement.update` with one argument: the merged object of `options` and the data passed to `execute`.
 *
 * If `options['when-visible']` is defined `targetElement` will only be updated if `targetElement.checkVisibility` returns `true`.
 *
 * If `options.immediate` is defined `targetElement` is updated immediately.
 *
 * Otherwise the update is wrapped in a `requestAnimationFrame`.
 *
 * @example
 * ```html
 * <script>
 *   // prettier-ignore
 *   window.customElements.define('gm-updatable', class extends HTMLDivElement {
 *     update() {
 *       this.textContent = 'text'
 *     }
 *   }, {
 *     extends: 'div',
 *   })
 * </script>
 * <button
 *   data-onclick="element-update@updatable"
 *   is="gm-button"
 * >
 *   update
 * </button>
 * <div
 *   id="updatable"
 *   is="gm-updatable"
 * ></div>
 * ```
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
