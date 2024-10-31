import type { DialogElement } from '../elements/dialog.js'
import { Command } from '../helpers/command.js'

export class DialogCloseCommand extends Command<DialogElement> {
  public execute(): void {
    this.targetElement.close()
  }
}
