import { Command } from '../commander/command.js'

/**
 * Sets a visual error message for an `<input>`, `<select>` or `<textarea>`.
 *
 * Looks for an element `[data-error]` inside a `<label>` associated with the `<input>`.
 *
 * Sets [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) of that element with the value of {@link targetElement}.[validationMessage](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/validationMessage).
 *
 * @example
 * See [a live example](../../examples/commands.html#input-set-error) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/input-set-error.html}
 */
export class InputSetErrorCommand extends Command<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  public execute(): void {
    const errorElement = document.querySelector(`label[for="${this.targetElement.id}"] [data-error]`)

    if (errorElement instanceof HTMLElement) {
      errorElement.textContent = this.targetElement.validationMessage.replace('.', '')
    }
  }
}
