import type { FormElement } from '../elements/form.js'
import type { CommandExecution } from '../helpers/commander.js'
import { Command } from '../helpers/command.js'

export interface FormRespondCommandData {
  response: Response
}

export class FormRespondCommand extends Command<FormElement> {
  public async execute(data?: FormRespondCommandData): Promise<void> {
    const contentType = data?.response.headers.get('content-type')

    if (contentType?.startsWith('application/json') === true) {
      const commands = await data?.response.json() as CommandExecution[]
      this.targetElement.commander.executeAll(commands)
    }
  }
}
