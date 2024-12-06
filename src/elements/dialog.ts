import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'
import { KeyBinding } from '../util/key-binding.js'

/**
 * A custom dialog element.
 *
 * Can be closed with the escape key.
 *
 * Sets an appropriate CSS `z-index` property.
 *
 * Moves output elements to the correct stacking context to ensure that the output elements remain on top of the last opened dialog element.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="popover-show@popover"
 *   is="gm-button"
 * >
 *   1. show popover (bottom right)
 * </button>
 * <button
 *   data-onclick="popover-hide@popover"
 *   is="gm-button"
 * >
 *   4. hide popover
 * </button>
 * <output
 *   id="popover"
 *   is="gm-output"
 *   popover="manual"
 *   style="margin: 0; inset: auto 0 0 auto"
 * >
 *   <button
 *     data-onclick="dialog-show@dialog?modal=true"
 *     is="gm-button"
 *   >
 *     2. open dialog
 *   </button>
 * </output>
 * <dialog
 *   id="dialog"
 *   is="gm-dialog"
 * >
 *   <button
 *     data-onclick="dialog-close@dialog"
 *     is="gm-button"
 *   >
 *     3. close dialog
 *   </button>
 * </dialog>
 * ```
 */
export class DialogElement<StateValues = Record<string, unknown>> extends HTMLDialogElement implements CommandableElement, StatefulElement<StateValues> {
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
   * A bound `close`.
   */
  protected closeBound = this.close.bind(this)

  /**
   * Creates a custom dialog element.
   */
  public constructor() {
    super()
    this.addEventListener('cancel', this.handleCancel.bind(this))
    this.addEventListener('focus', this.handleFocus.bind(this))
    this.addEventListener('close', this.handleClose.bind(this))
    this.addEventListener('transitioncancel', this.handleTransitionend.bind(this))
    this.addEventListener('transitionend', this.handleTransitionend.bind(this))
  }

  /**
   * Removes the `data-disconnected` attribute from the element.
   *
   * Sets up `commander`.
   *
   * Registers itself with `state` and `escapeBinding`.
   *
   * Executes a `connected` command.
   */
  public connectedCallback(): void {
    this.toggleAttribute('data-disconnected', false)
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  /**
   * Adds a `data-disconnected` attribute to the element.
   *
   * Unregisters itself from `state` and `escapeBinding`.
   *
   * Executes a `disconnected` commands and stops `commander`.
   */
  public disconnectedCallback(): void {
    this.toggleAttribute('data-disconnected', true)
    this.state?.unregister(this)
    this.escapeBinding.unregister(this.closeBound)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  /**
   * Show the dialog element.
   *
   * Updates the CSS `z-index` property of the dialog element.
   *
   * Resets the output elements in the document.
   *
   * Registers itself with `escapeBinding` and executes a `show` command.
   */
  public override show(): void {
    super.show()
    this.updateZIndex()
    this.resetOutputs()
    this.escapeBinding.register(this.closeBound)
    this.commander.execute('show')
  }

  /**
   * Show the dialog element as a modal.
   *
   * Resets the output elements in the document.
   *
   * Registers itself with `escapeBinding` and executes a `show` command.
   */
  public override showModal(): void {
    super.showModal()
    this.resetOutputs()
    this.escapeBinding.register(this.closeBound)
    this.commander.execute('show')
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
   * Finds the maximum CSS `z-index` property value of all open dialogs. Defaults to 3.
   *
   * @returns the index
   */
  protected findMaxZIndex(): number {
    const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'))

    return dialogs.reduce((zIndex, dialog) => {
      return Math.max(zIndex, Number(dialog.style.getPropertyValue('z-index')))
    }, 3)
  }

  /**
   * Finds all output elements in the document.
   *
   * @returns the output elements
   */
  protected findOutputElements(): HTMLOutputElement[] {
    return [
      ...Array.from(document.querySelectorAll('output')),
      ...Array.from(this.querySelectorAll('output')),
    ]
  }

  /**
   * Finds the currently open dialog element in the document or the document body if there is no open dialog element.
   *
   * @returns the element
   */
  protected findParentElement(): HTMLElement {
    return Array
      .from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'))
      .pop() ?? document.body
  }

  /**
   * Prevents the default event.
   *
   * @param event the event
   */
  protected handleCancel(event: Event): void {
    event.preventDefault()
  }

  /**
   * Executes a `closed` command if the CSS `display` property of the dialog element is "none".
   *
   * Updates the CSS `z-index` property of the dialog element.
   *
   * Resets the output elements in the document.
   *
   * Unregisters itself from `escapeBinding`.
   */
  protected handleClose(): void {
    if (window.getComputedStyle(this).display === 'none') {
      this.commander.execute('close')
    }

    this.updateZIndex()
    this.resetOutputs()
    this.escapeBinding.unregister(this.closeBound)
  }

  /**
   * Updates the CSS `z-index` property of the dialog element.
   *
   * Reregisters itself with `escapeBinding`.
   */
  protected handleFocus(): void {
    this.escapeBinding.unregister(this.closeBound)
    this.escapeBinding.register(this.closeBound)
    this.updateZIndex()
  }

  /**
   * Executes a `close` command if the closing transition has finished.
   *
   * @param event the event
   */
  protected handleTransitionend(event: TransitionEvent): void {
    if (
      event.propertyName === 'display' &&
      window.getComputedStyle(this).display === 'none'
    ) {
      this.commander.execute('close')
    }
  }

  /**
   * Iterates over all output elements in the document and appends them to the appropriate `parent element`.
   *
   * Adds a class `immediate`, calls `hidePopover` and removes the class afterwards.
   */
  protected resetOutputs(): void {
    const parentElement = this.findParentElement()

    this
      .findOutputElements()
      .forEach((outputElement) => {
        parentElement.appendChild(outputElement)
        outputElement.classList.add('immediate')
        outputElement.showPopover()

        window.requestAnimationFrame(() => {
          outputElement.classList.remove('immediate')
        })
      })
  }

  /**
   * Sets the CSS `z-index` property to `maximum z-index` + 1 if the dialog element is open.
   *
   * Otherwise removes the CSS `z-index` property.
   */
  protected updateZIndex(): void {
    if (this.open) {
      this.style.setProperty('z-index', `${this.findMaxZIndex() + 1}`)
    } else {
      this.style.removeProperty('z-index')
    }
  }
}
