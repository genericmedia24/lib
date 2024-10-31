import type { StatefulElement } from './stateful.js'
import { Commander } from '../helpers/commander.js'
import { State } from '../helpers/state.js'

export class ButtonElement<StateValues = Record<string, unknown>> extends HTMLButtonElement implements StatefulElement<StateValues> {
  public commander = new Commander(this)

  public state?: State<StateValues>

  public constructor() {
    super()
    this.addEventListener('auxclick', this.handleAuxclick.bind(this))
    this.addEventListener('click', this.handleClick.bind(this))
    this.addEventListener('contextmenu', this.handleContextmenu.bind(this))
    this.addEventListener('dblclick', this.handleDblclick.bind(this))
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

  protected handleAuxclick(event: MouseEvent): void {
    this.commander.execute('auxclick', {
      event,
    })
  }

  protected handleClick(event: MouseEvent): void {
    this.commander.execute('click', {
      event,
    })
  }

  protected handleContextmenu(event: MouseEvent): void {
    this.commander.execute('contextmenu', {
      event,
    })
  }

  protected handleDblclick(event: MouseEvent): void {
    this.commander.execute('dblclick', {
      event,
    })
  }
}
