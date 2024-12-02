import { Command } from '../commander/command.js'

/**
 * Shows and hides elements based on a `<select>` value.
 *
 * Toggles the `hidden` attribute on elements with an `[data-select-toggle]` attribute containing the ID of {@link targetElement}.
 *
 * The `hidden` attribute will be set to `true` if `[data-select-toggle-value]` does not include the value of {@link targetElement} and to `true` if it does.
 *
 * @example
 * See [a live example](../../examples/commands.html#select-toggle) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/select-toggle.html}
 */
export class SelectToggleCommand extends Command<HTMLSelectElement> {
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
