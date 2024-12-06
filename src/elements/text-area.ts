import throttle from 'throttleit'
import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'

/**
 * A custom textarea element.
 *
 * Delegates five events to `commander`.
 *
 * * `blur`
 * * `focus`
 * * `input`
 * * `keydown` (only as `enter` and `ctrlenter`)
 * * `paste`
 *
 * @example
 * ```html
 * <textarea
 *   name="key-1"
 *   data-state="example"
 *   data-state-storage="none"
 *   data-oninput="input-set-state"
 *   is="gm-textarea"
 *   placeholder="Type something"
 * ></textarea>
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-set-text-content?state-key=key-1"
 *   is="gm-div"
 * ></div>
 * ```
 */
export class TextAreaElement<StateValues = Record<string, unknown>> extends HTMLTextAreaElement implements CommandableElement, StatefulElement<StateValues> {
  /**
   * The commander.
   */
  public commander = new Commander(this)

  /**
   * The state.
   */
  public state?: State<StateValues>

  /**
   * Creates a custom textarea element.
   */
  public constructor() {
    super()
    this.addEventListener('blur', this.handleBlur.bind(this))
    this.addEventListener('focus', this.handleFocus.bind(this))
    this.addEventListener('input', throttle(this.handleInput.bind(this), 50))
    this.addEventListener('keydown', this.handleKeydown.bind(this))
    this.addEventListener('paste', this.handlePaste.bind(this))
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
   * Executes a `blur` command.
   *
   * @param event the event
   */
  protected handleBlur(event: FocusEvent): void {
    this.commander.execute('blur', {
      event,
    })
  }

  /**
   * Executes a `focus` command.
   *
   * @param event the event
   */
  protected handleFocus(event: FocusEvent): void {
    this.commander.execute('focus', {
      event,
    })
  }

  /**
   * Executes an `input` command.
   *
   * @param event the event
   */
  protected handleInput(event: Event): void {
    this.commander.execute('input', {
      event,
    })
  }

  /**
   * Executes an `enter` or `ctrlevent` command if their respective keys have been pressed.
   *
   * @param event the event
   */
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

  /**
   * Executes a `paste` command.
   *
   * @param event the event
   */
  protected handlePaste(event: ClipboardEvent): void {
    this.commander.execute('paste', {
      event,
    })
  }
}