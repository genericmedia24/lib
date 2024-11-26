import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'
import { KeyBinding } from '../util/key-binding.js'

export class DivElement<StateValues = Record<string, unknown>> extends HTMLDivElement implements CommandableElement, StatefulElement<StateValues> {
  public commander = new Commander(this)

  public escapeBinding = KeyBinding.create({
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
    this.escapeBinding.unregister(this.hidePopoverBound)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  public override hidePopover(): void {
    super.hidePopover()
    this.escapeBinding.unregister(this.hidePopoverBound)
  }

  public override showPopover(): void {
    super.showPopover()
    this.escapeBinding.register(this.hidePopoverBound)
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
