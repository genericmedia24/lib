import type { CommandableElement } from '../commander/commandable-element.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Commander } from '../commander/commander.js'
import { State } from '../state/state.js'
import { KeyBinding } from '../util/key-binding.js'

declare global {
  interface HTMLElementEventMap {
    toggle: ToggleEvent
  }
}

/**
 * A custom output element.
 *
 * Can be used as a "snackbar" (Material) or "toast" (Bootstrap).
 *
 * Can be closed with the escape key.
 *
 * Will stack multiple output elements in the document from the bottom upward.
 *
 * The bottom position of the lowest element can be set with the CSS `--output-bottom` variable in pixels.
 *
 * Gaps between the elements can be set with the CSS `--output-gap` variable in pixels.
 *
 * @example
 * See [a live example](../../examples/elements.html#output) of the code below.
 *
 * {@includeCode ../../docs/examples/elements/output.html}
 */
export class OutputElement<StateValues = Record<string, unknown>> extends HTMLOutputElement implements CommandableElement, StatefulElement<StateValues> {
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
   * Creates a custom output element.
   */
  public constructor() {
    super()
    this.addEventListener('toggle', this.handleToggle.bind(this))
    this.addEventListener('transitioncancel', this.handleTransitionend.bind(this))
    this.addEventListener('transitionend', this.handleTransitionend.bind(this))
  }

  /**
   * Sets up {@link state} and starts {@link commander}.
   *
   * Registers itself with {@link state} and {@link escapeBinding}.
   *
   * Executes a `connected` command.
   *
   * Calls {@link hidePopover} after a timeout set with the `data-timeout` attribute. If the attribute is not defined or set to -1 the call is not made.
   *
   */
  public connectedCallback(): void {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')

    const { timeout } = this.dataset

    if (
      timeout !== undefined &&
      timeout !== '-1'
    ) {
      window.setTimeout(this.hidePopover.bind(this), Number(timeout))
    }

    if (this.popover !== 'manual') {
      this.showPopover()
    }
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
   * Hides the popover element and unregisters itself from {@link escapeBinding}.
   */
  public override hidePopover(): void {
    super.hidePopover()
    this.escapeBinding.unregister(this.hidePopoverBound)
  }

  /**
   * Shows the popover element and registers itself with {@link escapeBinding}.
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

  /**
   * Executes an `open` command if the state of the output element is "open".
   *
   * Executes a `closed` command if the state of the output element is "closed" and its CSS `display` property is "none".
   *
   * Resets the output elements in the document.
   *
   * @param event the event
   */
  protected handleToggle(event: ToggleEvent): void {
    if (event.newState === 'open') {
      this.commander.execute('open')
    } else if (event.newState === 'closed') {
      if (window.getComputedStyle(this).display === 'none') {
        this.commander.execute('closed')
      }
    }

    this.resetOutputs(event)
  }

  /**
   * Executes a `closed` command if the closing transition has finished.
   *
   * @param event the event
   */
  protected handleTransitionend(event: TransitionEvent): void {
    if (
      event.propertyName === 'display' &&
      window.getComputedStyle(this).display === 'none'
    ) {
      this.commander.execute('closed')
    }
  }

  /**
   * Iterates over all output elements in the document.
   *
   * Moves the elements to their correct position from the bottom upward. The last element added is set closest to the bottom.
   *
   * @param event the event
   */
  protected resetOutputs(event: ToggleEvent): void {
    let bottom: number | undefined = undefined
    let gap: number | undefined = undefined
    let style: CSSStyleDeclaration | undefined = undefined

    Array
      .from(document.querySelectorAll('output'))
      .filter((element) => {
        return (
          event.newState === 'open' ||
          element !== this
        )
      })
      .reverse()
      .forEach((element, index) => {
        if (
          bottom === undefined ||
          gap === undefined
        ) {
          style = window.getComputedStyle(element)
          gap = parseInt(style.getPropertyValue('--output-gap'), 10)
          bottom = parseInt(style.getPropertyValue('--output-bottom'), 10)
        }

        element.style.setProperty('bottom', `${bottom + (gap * (index + 1))}px`)
        bottom += element.getBoundingClientRect().height
      })
  }
}
