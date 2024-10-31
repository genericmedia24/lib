import type { CommandableElement } from './commandable.js'
import type { StatefulElement } from './stateful.js'
import { Commander } from '../helpers/commander.js'
import { State } from '../helpers/state.js'

export class Element<StateValues = Record<string, unknown>> extends HTMLElement implements CommandableElement, StatefulElement<StateValues> {
  public commander = new Commander(this)

  public state?: State<StateValues>

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
}
