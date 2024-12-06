import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'
import { KeyBinding } from '../util/key-binding.js'

/**
 * A custom div element.
 *
 * @example
 * ```html
 * <button
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onclick="element-set-state?state-key=key-1&state-value=value-1"
 *   is="gm-button"
 * >
 *   set
 * </button>
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-set-text-content?state-key=key-1"
 *   is="gm-div"
 * ></div>
 * ```
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
   * A bound `hidePopover`.
   */
  protected hidePopoverBound = this.hidePopover.bind(this)

  /**
   * Sets up `state` and starts `commander`.
   *
   * Registers itself with `state` and `escapeBinding`.
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
   * Unregisters itself from `state` and `escapeBinding`.
   *
   * Executes a `disconnected` commands and stops `commander`.
   */
  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.escapeBinding.unregister(this.hidePopoverBound)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  /**
   * Hides the popover and unregisters itself from `escapeBinding`.
   */
  public override hidePopover(): void {
    super.hidePopover()
    this.escapeBinding.unregister(this.hidePopoverBound)
  }

  /**
   * Shows the popover and registers itself with `escapeBinding`.
   */
  public override showPopover(): void {
    super.showPopover()
    this.escapeBinding.register(this.hidePopoverBound)
  }

  /**
   * Calls `commander.executeState`.
   *
   * @param newValues the new values
   * @param oldValues the old values
   */
  public stateChangedCallback(newValues: Partial<StateValues>, oldValues?: Partial<StateValues>): void {
    this.commander.executeState(newValues, oldValues)
  }
}
