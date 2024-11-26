import type { DialogElement } from '../elements/dialog.js'
import { Command } from '../commander/command.js'

export interface DialogToggleCommandOptions {
  modal?: string
}

export class DialogToggleCommand extends Command<DialogElement, DialogToggleCommandOptions> {
  public execute(): void {
    if (this.targetElement.open) {
      this.targetElement.close()
    } else if (this.options.modal === undefined) {
      this.targetElement.show()
    } else {
      this.targetElement.showModal()
    }
  }
}
