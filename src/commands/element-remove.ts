import { Command } from '../commander/command.js'

/**
 * A command to remove an element.
 *
 * Calls `targetElement.remove`.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="element-remove@div"
 *   type="button"
 *   is="gm-button"
 * >
 *   remove
 * </button>
 * <div id="div">text</div>
 * ```
 */
export class ElementRemoveCommand extends Command {
  /**
   * Executes the command.
   */
  public execute(): void {
    this.targetElement.remove()
  }
}
