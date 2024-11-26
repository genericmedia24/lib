import { Command } from '../commander/command.js'

export class ElementFocusCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.focus()
  }
}
