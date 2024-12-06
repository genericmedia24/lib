import type { CommandExecution } from '../commander/commander.js'
import type { FormElement } from '../elements/form.js'
import { Command } from '../commander/command.js'
import { isArray } from '../util/is-array.js'

export interface FormRespondCommandData {
  /**
   * The response
   */
  response: Response
}

/**
 * Executes commands provided in the body of `data.response`.
 *
 * @example
 * ```html
 * <form
 *   data-onresponse="form-respond"
 *   data-onok="element-set-text-content@output"
 * >
 *   <output id="output"></output>
 * </form>
 * ```
 *
 * The response body should contain the following JSON:
 *
 * ```json
 * [
 *   {
 *     "data": {
 *       "text-content": "The data has been processed"
 *     },
 *     "event": "ok"
 *   }
 * ]
 * ```
 */
export class FormRespondCommand extends Command<FormElement> {
  public async execute(data?: FormRespondCommandData): Promise<void> {
    const contentType = data?.response.headers.get('content-type')

    if (contentType?.startsWith('application/json') === true) {
      const commands = await data?.response.json() as CommandExecution[]

      const isCommands = isArray<CommandExecution[]>(commands, (value) => {
        return typeof value[0]?.event === 'string'
      })

      if (isCommands) {
        this.targetElement.commander.executeAll(commands)
      }
    }
  }
}
