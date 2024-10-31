import type { FormElement } from '../elements/form.js'
import { Command } from '../helpers/command.js'

type InputErrors = Record<string, string>

export interface FormSetErrorsCommandOptions {
  data: InputErrors
}

export class FormSetErrorsCommand extends Command<FormElement> {
  public execute(options: FormSetErrorsCommandOptions): void {
    Object
      .entries(options.data)
      .forEach(([id, message]) => {
        const element = this.targetElement.querySelector(`label[for="${id}"] [data-error]`)

        if (element instanceof HTMLElement) {
          element.textContent = message
        }
      })
  }
}
