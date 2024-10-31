import type { FormElement } from '../elements/form.js'
import type { Commands } from '../helpers/commander.js'
import { Command } from '../helpers/command.js'

export interface FormRespondCommandOptions {
  response: Response
}

export class FormRespondCommand extends Command<FormElement, FormRespondCommandOptions> {
  public async execute(options: FormRespondCommandOptions): Promise<void> {
    const contentType = options.response.headers.get('content-type')

    if (contentType?.startsWith('application/json') === true) {
      const commands = await options.response.json() as Commands
      this.targetElement.commander.executeAll(commands)
    }
  }
}
