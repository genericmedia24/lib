import { Command } from '../helpers/command.js'

export class ElementRemoveCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.remove()
  }
}
