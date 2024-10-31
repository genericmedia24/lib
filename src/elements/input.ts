import throttle from 'throttleit'
import type { StatefulElement } from './stateful.js'
import { Commander } from '../helpers/commander.js'
import { State } from '../helpers/state.js'

export class InputElement<StateValues = Record<string, unknown>> extends HTMLInputElement implements StatefulElement<StateValues> {
  public commander = new Commander(this)

  public state?: State<StateValues>

  public constructor() {
    super()
    this.addEventListener('blur', this.handleBlur.bind(this))
    this.addEventListener('focus', this.handleFocus.bind(this))
    this.addEventListener('input', throttle(this.handleInput.bind(this), 50))
    this.addEventListener('keydown', this.handleKeydown.bind(this))
    this.addEventListener('paste', this.handlePaste.bind(this))
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

  protected handleBlur(event: FocusEvent): void {
    this.commander.execute('blur', {
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

  protected handlePaste(event: ClipboardEvent): void {
    this.commander.execute('paste', {
      event,
    })
  }
}
