import type { FormElement } from '../elements/form.js'
import { Command } from '../helpers/command.js'

type InputErrors = Record<string, string>

export interface FormSetErrorsCommandData {
  data: InputErrors
}

export class FormSetErrorsCommand extends Command<FormElement> {
  public execute(data?: FormSetErrorsCommandData): void {
    Object
      .entries(data?.data ?? {})
      .forEach(([id, message]) => {
        const element = this.targetElement.querySelector(`label[for="${id}"] [data-error]`)

        if (element instanceof HTMLElement) {
          element.textContent = message
        }
      })
  }
}
