import type { OutputElement } from '../elements/output.js'
import { Command } from '../commander/command.js'

export class OutputHideCommand extends Command<OutputElement> {
  public execute(): void {
    this.targetElement.hidePopover()
  }
}
