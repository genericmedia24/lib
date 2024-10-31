import type { CommandableElement } from './commandable.js'
import type { RequestableElement } from './requestable.js'
import type { StatefulElement } from './stateful.js'
import { Commander } from '../helpers/commander.js'
import { Requester } from '../helpers/requester.js'
import { State } from '../helpers/state.js'

export class FormElement<StateValues = Record<string, unknown>> extends HTMLFormElement implements CommandableElement, RequestableElement, StatefulElement<StateValues> {
  public commander = new Commander(this)

  public requester = new Requester(this)

  public state?: State<StateValues>

  protected busy = false

  public constructor() {
    super()
    this.addEventListener('submit', this.handleSubmit.bind(this))
  }

  public connectedCallback(): void {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.commander.execute('disconnected')
  }

  public stateChangedCallback(newValues: Partial<StateValues>, oldValues?: Partial<StateValues>): void {
    this.commander.executeState(newValues, oldValues)
  }

  protected handleSubmit(event: SubmitEvent): void {
    event.preventDefault()

    let {
      action,
      enctype,
      method,
    } = this

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
      ? new FormData(this)
      : new URLSearchParams(Object.fromEntries(new FormData(this)) as Record<string, string>)

    if (action.length === 0) {
      this.commander.execute('submit', {
        body,
      })
    } else {
      this.requester
        .fetch(action, {
          body,
          method,
        })
        .then((response) => {
          if (response !== undefined) {
            this.commander.execute('response', {
              response,
            })
          }
        })
        .catch((error: unknown) => {
          this.commander.handleError(error)
        })
    }
  }
}
