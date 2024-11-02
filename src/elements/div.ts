import type { StatefulElement } from './stateful.js'
import { Commander } from '..//helpers/commander.js'
import { KeyBinding } from '../helpers/key-binding.js'
import { State } from '../helpers/state.js'

export class DivElement<StateValues = Record<string, unknown>> extends HTMLDivElement implements StatefulElement<StateValues> {
  public commander = new Commander(this)

  public escape = KeyBinding.create({
    key: 'escape',
  })

  public state?: State<StateValues>

  protected hidePopoverBound = this.hidePopover.bind(this)

  public connectedCallback(): void {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.escape.unregister(this.hidePopoverBound)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  public override hidePopover(): void {
    super.hidePopover()
    this.escape.unregister(this.hidePopoverBound)
  }

  public override showPopover(): void {
    super.showPopover()
    this.escape.register(this.hidePopoverBound)
  }

  public stateChangedCallback(newValues: Partial<StateValues>, oldValues?: Partial<StateValues>): void {
    this.commander.execute('statechanged', {
      newValues,
      oldValues,
    })

    Object
      .entries(newValues)
      .forEach(([key, value]) => {
        this.commander.execute(`${key.toLowerCase()}changed`, {
          newValues: {
            [key]: value,
          },
          oldValues: {
            [key]: (oldValues as Record<string, unknown> | undefined)?.[key],
          },
        })
      })
  }
}
