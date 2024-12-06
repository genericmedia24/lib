import { Command } from '../commander/command.js'

/**
 * A command to set the error of an input.
 *
 * Sets a visual error message for an `<input>`, `<select>` or `<textarea>`.
 *
 * Looks for an element `[data-error]` inside a `<label>` associated with the `<input>`.
 *
 * Sets `textContent` of that element with the value of `targetElement.validationMessage`.
 *
 * @example
 * ```html
 * <style>
 *   [data-error] {
 *     color: red;
 *   }
 * </style>
 * <label for="input">
 *   Input
 *   <span data-error></span>
 * </label>
 * <br>
 * <input
 *   id="input"
 *   data-onblur="input-set-error"
 *   is="gm-input"
 *   required
 * >
 * <br>
 * First focus, then blur the input.
 * ```
 */
export class InputSetErrorCommand extends Command<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  /**
   * Executes the command.
   */
  public execute(): void {
    const errorElement = document.querySelector(`label[for="${this.targetElement.id}"] [data-error]`)

    if (errorElement instanceof HTMLElement) {
      errorElement.textContent = this.targetElement.validationMessage.replace('.', '')
    }
  }
}
