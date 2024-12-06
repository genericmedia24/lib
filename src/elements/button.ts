import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

/**
 * A custom buttom element.
 *
 * Delegates four events to `commander`:
 *
 * * `auxclick`
 * * `click`
 * * `contextmenu`
 * * `dblclick`
 *
 * @example
 * ```html
 * <button
 *   data-onclick="element-set-text-content@div?text-content=text"
 *   is="gm-button"
 * >
 *   set
 * </button>
 * <div id="div"></div>
 * ```
 */
export class ButtonElement<StateValues = Record<string, unknown>> extends HTMLButtonElement implements CommandableElement, StatefulElement<StateValues> {
  /**
   * The commander.
   */
  public commander = new Commander(this)

  /**
   * The state.
   */
  public state?: State<StateValues>

  /**
   * Creates a custom button element.
   */
  public constructor() {
    super()
    this.addEventListener('auxclick', this.handleAuxclick.bind(this))
    this.addEventListener('click', this.handleClick.bind(this))
    this.addEventListener('contextmenu', this.handleContextmenu.bind(this))
    this.addEventListener('dblclick', this.handleDblclick.bind(this))
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
   * Executes an `auxclick` command.
   *
   * @param event the event
   */
  protected handleAuxclick(event: MouseEvent): void {
    this.commander.execute('auxclick', {
      event,
    })
  }

  /**
   * Executes a `click` command.
   *
   * @param event the event
   */
  protected handleClick(event: MouseEvent): void {
    this.commander.execute('click', {
      event,
    })
  }

  /**
   * Executes a `contextmenu` command.
   *
   * @param event the event
   */
  protected handleContextmenu(event: MouseEvent): void {
    this.commander.execute('contextmenu', {
      event,
    })
  }

  /**
   * Executes a `dblclick` command.
   *
   * @param event the event
   */
  protected handleDblclick(event: MouseEvent): void {
    this.commander.execute('dblclick', {
      event,
    })
  }
}
