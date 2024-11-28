import type { ButtonElement } from '../elements/button.js'
import { Command } from '../commander/command.js'

/**
 * Submits a `<form>` associated with a `<button>`.
 *
 * Sets {@link targetElement}.[type](https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/type) to `submit`.
 *
 * Then calls {@link targetElement}.[form](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).[requestSubmit](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit) on the associated `<form>`.
 *
 * Finally, resets {@link targetElement}.[type](https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/type) to `button`.
 *
 * @example
 * See [a live example](../../examples/commands.html#button-submit) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/button-submit.html}
 */
export class ButtonSubmitCommand extends Command<ButtonElement> {
  public execute(): void {
    if (this.targetElement.form !== null) {
      this.targetElement.type = 'submit'
      this.targetElement.form.requestSubmit(this.targetElement)
      this.targetElement.type = 'button'
    }
  }
}
