import { Command } from '../helpers/command.js'

export class PopoverHideCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.hidePopover()
  }
}
