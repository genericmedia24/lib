import { Command } from '../commander/command.js'

/**
 * A command to clear the HTML of an element.
 *
 * Sets `targetElement.innerHTML` to `''`.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="element-clear-html@div"
 *   type="button"
 *   is="gm-button"
 * >
 *   clear
 * </button>
 * <div id="div">text</div>
 * ```
 */
export class ElementClearHtmlCommand extends Command<HTMLElement> {
  /**
   * Executes the command.
   */
  public execute(): void {
    this.targetElement.innerHTML = ''
  }
}
