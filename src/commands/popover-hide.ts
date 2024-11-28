import { Command } from '../commander/command.js'

/**
 * Hides a popover.
 *
 * Calls {@link targetElement}.[hidePopover](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/hidePopover).
 *
 * @example
 * See [a live example](../../examples/commands.html#popover-hide) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/popover-hide.html}
 */
export class PopoverHideCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.hidePopover()
  }
}
