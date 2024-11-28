import { Command } from '../commander/command.js'

/**
 * Clears the HTML of an element.
 *
 * Sets {@link targetElement}.[innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) to `''`.
 *
 * @example
 * See [a live example](../../examples/commands.html#element-clear-html) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-clear-html.html}
 */
export class ElementClearHtmlCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.innerHTML = ''
  }
}
