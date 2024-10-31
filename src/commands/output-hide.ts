import type { OutputElement } from '../elements/output.js'
import { Command } from '../helpers/command.js'

export class OutputHideCommand extends Command<OutputElement> {
  public execute(): void {
    this.targetElement.hidePopover()
  }
}
