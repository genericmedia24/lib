import { Command } from '../commander/command.js'

export class ElementRemoveCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.remove()
  }
}
