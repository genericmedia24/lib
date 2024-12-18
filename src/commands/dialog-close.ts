import { Command } from '../commander/command.js'

/**
 * A command to close a dialog.
 *
 * Calls `targetElement.close`.
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
export class DialogCloseCommand extends Command<HTMLDialogElement> {
  /**
   * Executes the command.
   */
  public execute(): void {
    this.targetElement.close()
  }
}
