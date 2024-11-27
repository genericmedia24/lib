import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

export class FormElement<StateValues = Record<string, unknown>> extends HTMLFormElement implements CommandableElement, StatefulElement<StateValues> {
  public commander = new Commander(this)

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
    this.commander.stop()
  }

  public stateChangedCallback(newValues: Partial<StateValues>, oldValues?: Partial<StateValues>): void {
    this.commander.executeState(newValues, oldValues)
  }

  protected handleSubmit(event: SubmitEvent): void {
    this.commander.execute('submit', {
      event,
    })
  }
}
