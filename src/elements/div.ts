import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'
import { KeyBinding } from '../util/key-binding.js'

/**
 * A custom div element.
 *
 * @example
 * See [a live example](../../examples/elements.html#div) of the code below.
 *
 * {@includeCode ../../docs/examples/elements/div.html}
 */
export class DivElement<StateValues = Record<string, unknown>> extends HTMLDivElement implements CommandableElement, StatefulElement<StateValues> {
  /**
   * The commander.
   */
  public commander = new Commander(this)

  /**
   * A key binding for the escape key.
   */
  public escapeBinding = KeyBinding.create({
    key: 'escape',
  })

  /**
   * The state.
   */
  public state?: State<StateValues>

  /**
   * A bound {@link hidePopover}.
   */
  protected hidePopoverBound = this.hidePopover.bind(this)

  /**
   * Sets up {@link state} and starts {@link commander}.
   *
   * Registers itself with {@link state} and {@link escapeBinding}.
   *
   * Executes a `connected` command.
   */
  public connectedCallback(): void {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  /**
   * Unregisters itself from {@link state} and {@link escapeBinding}.
   *
   * Executes a `disconnected` commands and stops {@link commander}.
   */
  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.escapeBinding.unregister(this.hidePopoverBound)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  /**
   * Hides the popover and unregisters itself from {@link escapeBinding}.
   */
  public override hidePopover(): void {
    super.hidePopover()
    this.escapeBinding.unregister(this.hidePopoverBound)
  }

  /**
   * Shows the popover and registers itself with {@link escapeBinding}.
   */
  public override showPopover(): void {
    super.showPopover()
    this.escapeBinding.register(this.hidePopoverBound)
  }

  /**
   * Calls {@link Commander.executeState}.
   *
   * @param newValues the new values
   * @param oldValues the old values
   */
  public stateChangedCallback(newValues: Partial<StateValues>, oldValues?: Partial<StateValues>): void {
    this.commander.executeState(newValues, oldValues)
  }
}
