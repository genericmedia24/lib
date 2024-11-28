import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

/**
 * A custom form element.
 *
 * Delegates one event to  {@link commander}.
 *
 * * `submit`
 *
 * @example
 * See [a live example](../../examples/elements.html#form) of the code below.
 *
 * {@includeCode ../../docs/examples/elements/form.html}
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
   * Sets up {@link state} and starts {@link commander}.
   *
   * Registers itself with {@link state} and executes a `connected` command.
   */
  public connectedCallback(): void {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  /**
   * Unregisters itself from {@link state}.
   *
   * Executes a `disconnected` commands and stops {@link commander}.
   */
  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.commander.execute('disconnected')
    this.commander.stop()
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
