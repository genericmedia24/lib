import { Command } from '../commander/command.js'

/**
 * A command to toggle elements based on a select value.
 *
 * Toggles the `hidden` attribute on elements with an `[data-select-toggle]` attribute containing the ID of `targetElement`.
 *
 * The `hidden` attribute will be set to `true` if `[data-select-toggle-value]` does not include the value of `targetElement` and to `true` if it does.
 *
 * @example
 * ```html
 * <select
 *   id="key-1"
 *   data-onconnected="select-toggle"
 *   data-onchange="select-toggle"
 *   is="gm-select"
 * >
 *   <option>value-1</option>
 *   <option>value-2</option>
 * </select>
 * <div
 *   data-select-toggle="key-1"
 *   data-select-toggle-value="value-1"
 *   hidden
 * >
 *   value-1
 * </div>
 * <div
 *   data-select-toggle="key-1"
 *   data-select-toggle-value="value-2"
 *   hidden
 * >
 *   value-2
 * </div>
 * ```
 */
export class SelectToggleCommand extends Command<HTMLSelectElement> {
  /**
   * Executes the command.
   */
  public execute(): void {
    document
      .querySelectorAll<HTMLElement>(`[data-select-toggle=${this.targetElement.id}]`)
      .forEach((element) => {
        const force = element.dataset.selectToggleValue?.includes(this.targetElement.value) === false

        element.toggleAttribute('hidden', force)

        element
          .querySelectorAll<HTMLInputElement>('input, select, textarea')
          .forEach((input) => {
            input.toggleAttribute('disabled', force)
          })
      })
  }
}
