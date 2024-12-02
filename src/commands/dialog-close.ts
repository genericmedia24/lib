import { Command } from '../commander/command.js'

/**
 * Closes a `<dialog>`.
 *
 * Calls {@link targetElement}.[close](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close).
 *
 * @example
 * See [a live example](../../examples/commands.html#dialog-close) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/dialog-close.html}
 */
export class DialogCloseCommand extends Command<HTMLDialogElement> {
  public execute(): void {
    this.targetElement.close()
  }
}
