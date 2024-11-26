import { Command } from '../commander/command.js'

export class WindowBackCommand extends Command<Window> {
  public execute(): void {
    if (this.targetElement.history.length === 2) {
      this.targetElement.location.href = '/'
    } else {
      this.targetElement.history.back()
    }
  }
}
