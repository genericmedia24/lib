import { Command } from '../commander/command.js'

export interface WindowPostCommandData {
  level?: string
  text?: string
  type?: string
}

export class WindowPostCommand extends Command<Window, Record<string, unknown>> {
  public execute(data?: WindowPostCommandData): void {
    this.targetElement.postMessage({
      ...this.options,
      ...data,
    })
  }
}
