import type { FormElement } from '../elements/form.js'
import { Command } from '../helpers/command.js'

export interface FormSetErrorsCommandData {
  data: Record<string, string>
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
