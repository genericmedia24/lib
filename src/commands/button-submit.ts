import type { ButtonElement } from '../elements/button.js'
import { Command } from '../helpers/command.js'

export class ButtonSubmitCommand extends Command<ButtonElement> {
  public execute(): void {
    if (this.targetElement.form !== null) {
      this.targetElement.type = 'submit'
      this.targetElement.form.requestSubmit(this.targetElement)
      this.targetElement.type = 'button'
    }
  }
}
