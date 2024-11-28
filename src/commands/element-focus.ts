import { Command } from '../commander/command.js'

/**
 * Focuses an element.
 *
 * Calls {@link targetElement}.[focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus).
 *
 * @example
 * See [a live example](../../examples/commands.html#element-focus) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-focus.html}
 */
export class ElementFocusCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.focus()
  }
}
