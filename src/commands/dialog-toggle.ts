import type { DialogElement } from '../elements/dialog.js'
import { Command } from '../commander/command.js'

export interface DialogToggleCommandOptions {
  /**
   * Whether to show the `<dialog>` as a modal.
   */
  modal?: string
}

/**
 * Shows a `<dialog>`.
 *
 * Calls {@link targetElement}.[close](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close) if {@link targetElement}.[open](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/open) is `true`.
 *
 * Calls {@link targetElement}.[showModal](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) if {@link DialogToggleCommandOptions.modal | options.modal} is defined.
 *
 * Otherwise calls {@link targetElement}.[show](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/show).

 * @example
 * See [a live example](../../examples/commands.html#dialog-toggle) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/dialog-toggle.html}
 */
export class DialogToggleCommand extends Command<DialogElement, DialogToggleCommandOptions> {
  public execute(): void {
    if (this.targetElement.open) {
      this.targetElement.close()
    } else if (this.options.modal === undefined) {
      this.targetElement.show()
    } else {
      this.targetElement.showModal()
    }
  }
}
