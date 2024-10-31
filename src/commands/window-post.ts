import { Command } from '../helpers/command.js'

export interface WindowPostCommandOptions {
  level?: string
  text?: string
  type?: string
}

export class WindowPostCommand extends Command<Window, WindowPostCommandOptions> {
  public execute(options: WindowPostCommandOptions): void {
    this.targetElement.postMessage(options)
  }
}
