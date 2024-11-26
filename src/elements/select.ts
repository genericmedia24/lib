import throttle from 'throttleit'
import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

export class SelectElement<StateValues = Record<string, unknown>> extends HTMLSelectElement implements CommandableElement, StatefulElement<StateValues> {
  public commander = new Commander(this)

  public state?: State<StateValues>

  public constructor() {
    super()
    this.addEventListener('blur', this.handleBlur.bind(this))
    this.addEventListener('change', this.handleChange.bind(this))
    this.addEventListener('focus', this.handleFocus.bind(this))
    this.addEventListener('input', throttle(this.handleInput.bind(this), 50))
    this.addEventListener('keydown', this.handleKeydown.bind(this))
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

  protected handleBlur(event: FocusEvent): void {
    this.commander.execute('blur', {
      event,
    })
  }

  protected handleChange(event: Event): void {
    this.commander.execute('change', {
      event,
    })
  }

  protected handleFocus(event: FocusEvent): void {
    this.commander.execute('focus', {
      event,
    })
  }

  protected handleInput(event: Event): void {
    this.commander.execute('input', {
      event,
    })
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (
        event.ctrlKey ||
        event.metaKey
      ) {
        this.commander.execute('ctrlenter', {
          event,
        })
      } else {
        this.commander.execute('enter', {
          event,
        })
      }
    }
  }
}
