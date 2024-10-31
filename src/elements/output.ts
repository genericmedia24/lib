import type { StatefulElement } from './stateful.js'
import { Commander } from '../helpers/commander.js'
import { KeyBinding } from '../helpers/key-binding.js'
import { State } from '../helpers/state.js'

declare global {
  interface HTMLElementEventMap {
    toggle: ToggleEvent
  }
}

export class OutputElement<StateValues = Record<string, unknown>> extends HTMLOutputElement implements StatefulElement<StateValues> {
  public commander = new Commander(this)

  public escape = KeyBinding.create({
    key: 'escape',
  })

  public state?: State<StateValues>

  protected hidePopoverBound = this.hidePopover.bind(this)

  public constructor() {
    super()
    this.addEventListener('toggle', this.handleToggle.bind(this))
    this.addEventListener('transitioncancel', this.handleTransitionend.bind(this))
    this.addEventListener('transitionend', this.handleTransitionend.bind(this))
  }

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
      setTimeout(this.hidePopover.bind(this), Number(timeout))
    }

    if (this.popover !== 'manual') {
      this.showPopover()
    }
  }

  public disconnectedCallback(): void {
    this.state?.unregister(this)
    this.escape.unregister(this.hidePopoverBound)
    this.commander.execute('disconnected')
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
    this.commander.executeState(newValues, oldValues)
  }

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

  protected handleTransitionend(event: TransitionEvent): void {
    if (
      event.propertyName === 'display' &&
      window.getComputedStyle(this).display === 'none'
    ) {
      this.commander.execute('closed')
    }
  }

  protected resetOutputs(event: ToggleEvent): void {
    let bottom: number | undefined = undefined
    let gap: number | undefined = undefined

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
          const style = window.getComputedStyle(element)
          gap = parseInt(style.getPropertyValue('--output-gap'), 10)
          bottom = parseInt(style.getPropertyValue('--output-bottom'), 10)
        }

        element.style.setProperty('bottom', `${bottom + (gap * (index + 1))}px`)
        bottom += element.getBoundingClientRect().height
      })
  }
}
