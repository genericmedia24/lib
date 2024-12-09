import { Command } from '../commander/command.js'

/**
 * A command to hide a popover.
 *
 * Calls `targetElement.hidePopover`.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="popover-show@popover"
 *   type="button"
 *   is="gm-button"
 * >
 *   show
 * </button>
 * <div
 *   id="popover"
 *   popover="manual"
 * >
 *   <span>popover</span>
 *   <button
 *     data-onclick="popover-hide@popover"
 *     type="button"
 *     is="gm-button"
 *   >
 *     hide
 *   </button>
 * </div>
 * ```
 */
export class PopoverHideCommand extends Command {
  /**
   * Executes the command.
   */
  public execute(): void {
    this.targetElement.hidePopover()
  }
}
