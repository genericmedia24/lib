import { Command } from '../commander/command.js'

export class ElementClearHtmlCommand extends Command<HTMLElement> {
  public execute(): void {
    this.targetElement.innerHTML = ''
  }
}
