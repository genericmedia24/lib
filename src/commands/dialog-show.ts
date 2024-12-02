import { Command } from '../commander/command.js'

export interface DialogShowCommandOptions {
  /**
   * Whether to show the `<dialog>` as a modal.
   */
  modal?: string
}

/**
 * Shows a `<dialog>`.
 *
 * Calls {@link targetElement}.[showModal](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) if {@link DialogShowCommandOptions.modal | options.modal} is defined.
 *
 * Otherwise calls {@link targetElement}.[show](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/show).
 *
 * @example
 * See [a live example](../../examples/commands.html#dialog-show) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/dialog-show.html}
 */
export class DialogShowCommand extends Command<HTMLDialogElement, DialogShowCommandOptions> {
  public execute(): void {
    if (this.options.modal === undefined) {
      this.targetElement.show()
    } else {
      this.targetElement.showModal()
    }
  }
}
