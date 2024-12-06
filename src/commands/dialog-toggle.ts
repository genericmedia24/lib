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
 * Calls `targetElement.close` if `targetElement.open` is `true`.
 *
 * Calls `targetElement.showModal` if `options.modal` is defined.
 *
 * Otherwise calls `targetElement.show`.

 * @example
 * ```html
 * <button
 *   data-onclick="dialog-toggle@dialog"
 *   type="button"
 *   is="gm-button"
 * >
 *   toggle
 * </button>
 * <dialog id="dialog">dialog</dialog>
 * ```
 */
export class DialogToggleCommand extends Command<HTMLDialogElement, DialogToggleCommandOptions> {
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
