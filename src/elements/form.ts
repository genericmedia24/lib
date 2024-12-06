import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

/**
 * A custom form element.
 *
 * Delegates one event to  `commander`.
 *
 * * `submit`
 *
 * @example
 * ```html
 * <form
 *   data-onsubmit="form-submit"
 *   data-onerror="element-set-text-content@output?text-content=error"
 *   data-onresponse="element-set-text-content@output?text-content=done"
 *   is="gm-form"
 * >
 *   <button formaction="/">submit /</button>
 *   <button formaction="/wrong-path">submit /wrong-path</button>
 *   <output id="output"></output>
 * </form>
 * ```
 */
export class FormElement<StateValues = Record<string, unknown>> extends HTMLFormElement implements CommandableElement, StatefulElement<StateValues> {
  /**
   * The commander.
   */
  public commander = new Commander(this)

  /**
   * The state.
   */
  public state?: State<StateValues>

  /**
   * Createa a custom form element.
   */
  public constructor() {
    super()
    this.addEventListener('submit', this.handleSubmit.bind(this))
  }

  /**
   * Sets up `state` and starts `commander`.
   *
   * Registers itself with `state` and executes a `connected` command.
   */
  public connectedCallback(): void {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  /**
   * Unregisters itself from `state`.
   *
   * Executes a `disconnected` commands and stops `commander`.
   */
  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.commander.execute('disconnected')
    this.commander.stop()
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

  /**
   * Executes a `submit` command.
   *
   * @param event the event
   */
  protected handleSubmit(event: SubmitEvent): void {
    this.commander.execute('submit', {
      event,
    })
  }
}
