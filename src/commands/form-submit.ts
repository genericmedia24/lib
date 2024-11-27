import type { FormElement } from '../elements/form.js'
import { Requester } from '../browser.js'
import { Command } from '../commander/command.js'

export interface FormSubmitCommandData {
  event: SubmitEvent
}

export class FormSubmitCommand extends Command<FormElement> {
  public requester = new Requester(this.targetElement)

  public override execute(data: FormSubmitCommandData): Promise<void> | void {
    const { event } = data

    event.preventDefault()

    let {
      action,
      enctype,
      method,
    } = this.targetElement

    if (event.submitter instanceof HTMLButtonElement) {
      if (event.submitter.hasAttribute('formaction')) {
        action = event.submitter.formAction
      }

      if (event.submitter.hasAttribute('formenctype')) {
        action = event.submitter.formEnctype
      }

      if (event.submitter.hasAttribute('formmethod')) {
        method = event.submitter.formMethod
      }
    }

    if (enctype.length === 0) {
      enctype = 'application/x-www-form-urlencoded'
    }

    if (method.length === 0) {
      method = 'get'
    }

    const body = enctype === 'multipart/form-data'
      ? new FormData(this.targetElement)
      : new URLSearchParams(Object.fromEntries(new FormData(this.targetElement)) as Record<string, string>)

    this.requester
      .fetch(action, {
        body,
        method,
      })
      .then((response) => {
        if (response !== undefined) {
          this.targetElement.commander.execute('response', {
            response,
          })
        }
      })
      .catch((error: unknown) => {
        this.targetElement.commander.handleError(error)
      })
  }
}
