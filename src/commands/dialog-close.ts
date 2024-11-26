import type { DialogElement } from '../elements/dialog.js'
import { Command } from '../commander/command.js'

export class DialogCloseCommand extends Command<DialogElement> {
  public execute(): void {
    this.targetElement.close()
  }
}
