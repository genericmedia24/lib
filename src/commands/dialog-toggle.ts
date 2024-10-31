import type { DialogElement } from '../elements/dialog.js'
import { Command } from '../helpers/command.js'

export interface DialogToggleCommandOptions {
  modal?: string
}

export class DialogToggleCommand extends Command<DialogElement> {
  public execute(options: DialogToggleCommandOptions): void {
    if (this.targetElement.open) {
      this.targetElement.close()
    } else if (options.modal === undefined) {
      this.targetElement.show()
    } else {
      this.targetElement.showModal()
    }
  }
}
