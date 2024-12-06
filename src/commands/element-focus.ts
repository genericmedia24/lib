import { Command } from '../commander/command.js'

/**
 * Focuses an element.
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
  public execute(): void {
    this.targetElement.focus()
  }
}
