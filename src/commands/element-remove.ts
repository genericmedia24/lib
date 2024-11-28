import { Command } from '../commander/command.js'

/**
 * Removes an element.
 *
 * Calls {@link targetElement}.[remove](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/remove).
 *
 * @example
 * See [a live example](../../examples/commands.html#element-remove) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-remove.html}
 */
export class ElementRemoveCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.remove()
  }
}
