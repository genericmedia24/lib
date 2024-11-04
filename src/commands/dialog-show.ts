import type { DialogElement } from '../elements/dialog.js'
import { Command } from '../helpers/command.js'

export interface DialogShowCommandOptions {
  modal?: string
}

export class DialogShowCommand extends Command<DialogElement, DialogShowCommandOptions> {
  public execute(): void {
    if (this.options.modal === undefined) {
      this.targetElement.show()
    } else {
      this.targetElement.showModal()
    }
  }
}
