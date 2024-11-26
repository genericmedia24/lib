import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

export class ButtonElement<StateValues = Record<string, unknown>> extends HTMLButtonElement implements CommandableElement, StatefulElement<StateValues> {
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
    this.commander.stop()
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
