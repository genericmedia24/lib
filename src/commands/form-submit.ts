import type { FormElement } from '../elements/form.js'
import { Command } from '../commander/command.js'
import { Requester } from '../requester/requester.js'

export interface FormSubmitCommandData {
  /**
   * The submit event.
   */
  event: SubmitEvent
}

/**
 * Submits a `<form>`.
 *
 * Uses `Requester` to fetch the resource.
 *
 * Reads the attributes of `FormSubmitCommandData.event | data.event.submitter` if available as a `<button>`.
 *
 * Executes a `response` command if a response is received.
 *
 * @example
 * ```html
 * <form
 *   data-onsubmit="form-submit"
 *   data-onerror="element-set-text-content@output?text-content=error"
 *   data-onresponse="element-set-text-content@output?text-content=done"
 *   is="gm-form"
 * >
 *   <button formaction="/">submit /</button>
 *   <button formaction="/wrong-path">submit /wrong-path</button>
 *   <output id="output"></output>
 * </form>
 * ```
 */
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

    action = event.submitter?.getAttribute('formaction') ?? action
    enctype = event.submitter?.getAttribute('formenctype') ?? enctype
    method = event.submitter?.getAttribute('formmethod') ?? method

    let body: FormData | null | URLSearchParams = null

    if (method === 'get') {
      action += `?${new window.URLSearchParams(Object.fromEntries(new window.FormData(this.targetElement)) as Record<string, string>).toString()}`
    } else {
      body = enctype === 'multipart/form-data'
        ? new window.FormData(this.targetElement)
        : new window.URLSearchParams(Object.fromEntries(new window.FormData(this.targetElement)) as Record<string, string>)
    }

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
