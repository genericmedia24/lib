import { Command } from '../commander/command.js'

/**
 * A command to focus an element.
 *
 * Calls `targetElement.focus`.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="element-focus@input"
 *   type="button"
 *   is="gm-button"
 * >
 *   focus
 * </button>
 * <input id="input">
 * ```
 */
export class ElementFocusCommand extends Command<HTMLElement> {
  /**
   * Executes the command.
   */
  public execute(): void {
    this.targetElement.focus()
  }
}
