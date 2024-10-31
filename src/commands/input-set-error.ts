import type { InputElement } from '../elements/input.js'
import { Command } from '../helpers/command.js'

export class InputSetErrorCommand extends Command<InputElement> {
  public execute(): void {
    const errorElement = document.querySelector(`label[for="${this.targetElement.id}"] [data-error]`)

    if (errorElement instanceof HTMLElement) {
      errorElement.textContent = this.targetElement.validationMessage.replace('.', '')
    }
  }
}
