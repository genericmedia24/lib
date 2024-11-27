import type { FormElement } from '../elements/form.js'
import type { CustomError } from '../util/custom-error.js'
import { Command } from '../commander/command.js'
import { isObject } from '../util/is-object.js'

export interface FormSetErrorsCommandData {
  error: CustomError
}

export class FormSetErrorsCommand extends Command<FormElement> {
  public execute(data?: FormSetErrorsCommandData): void {
    const errorData = data?.error.data

    if (isObject<Record<string, string>>(errorData)) {
      Object
        .entries(errorData)
        .forEach(([id, message]) => {
          const element = this.targetElement.querySelector(`label[for="${id}"] [data-error]`)

          if (element instanceof HTMLElement) {
            element.textContent = message
          }
        })
    }
  }
}
