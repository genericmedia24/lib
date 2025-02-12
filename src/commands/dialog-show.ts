import { Command } from '../commander/command.js'

/**
 * Command options.
 */
export interface DialogShowCommandOptions {
  /**
   * Whether to show the `<dialog>` as a modal.
   */
  modal?: string
}

/**
 * A command to show a dialog.
 *
 * Calls `targetElement.showModal` if `options.modal` is defined.
 *
 * Otherwise calls `targetElement.show`.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="dialog-show@dialog?modal=true"
 *   type="button"
 *   is="gm-button"
 * >
 *   show
 * </button>
 * <dialog id="dialog">
 *   <span>dialog</span>
 *   <button
 *     data-onclick="dialog-close@dialog"
 *     type="button"
 *     is="gm-button"
 *   >
 *     close
 *   </button>
 * </dialog>
 * ```
 */
export class DialogShowCommand extends Command<HTMLDialogElement, DialogShowCommandOptions> {
  /**
   * Executes the command.
   */
  public execute(): void {
    if (this.options.modal === undefined) {
      this.targetElement.show()
    } else {
      this.targetElement.showModal()
    }
  }
}
