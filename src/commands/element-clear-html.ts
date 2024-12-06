import { Command } from '../commander/command.js'

/**
 * Clears the HTML of an element.
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
  public execute(): void {
    this.targetElement.innerHTML = ''
  }
}
