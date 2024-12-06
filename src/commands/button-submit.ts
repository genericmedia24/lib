import { Command } from '../commander/command.js'

/**
 * Submits a `<form>` associated with a `<button>`.
 *
 * Sets `targetElement.type` to `"submit"`.
 *
 * Then calls `targetElement.form.requestSubmit`.
 *
 * Finally, resets `targetElement.type` to `"button"`.
 *
 * @example
 * ```html
 * <form
 *   data-onsubmit="form-submit"
 *   data-onresponse="element-set-text-content@output?text-content=done"
 *   action="/"
 *   is="gm-form"
 * >
 *   <button
 *     data-onclick="button-submit"
 *     type="button"
 *     is="gm-button"
 *   >
 *     submit
 *   </button>
 *   <output id="output"></output>
 * </form>
 * ```
 */
export class ButtonSubmitCommand extends Command<HTMLButtonElement> {
  public execute(): void {
    if (this.targetElement.form !== null) {
      this.targetElement.type = 'submit'
      this.targetElement.form.requestSubmit(this.targetElement)
      this.targetElement.type = 'button'
    }
  }
}
