import { Command } from '../helpers/command.js'

export class ElementFocusCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.focus()
  }
}
