import type { StatefulElement } from '../helpers/stateful.js'
import { Commander } from '../helpers/commander.js'
import { KeyBinding } from '../helpers/key-binding.js'
import { State } from '../helpers/state.js'

export class DialogElement<StateValues = Record<string, unknown>> extends HTMLDialogElement implements StatefulElement<StateValues> {
  public commander = new Commander(this)

  public escape = KeyBinding.create({
    key: 'escape',
  })

  public state?: State<StateValues>

  protected closeBound = this.close.bind(this)

  public constructor() {
    super()
    this.addEventListener('cancel', this.handleCancel.bind(this))
    this.addEventListener('focus', this.handleFocus.bind(this))
    this.addEventListener('close', this.handleClose.bind(this))
    this.addEventListener('transitioncancel', this.handleTransitionend.bind(this))
    this.addEventListener('transitionend', this.handleTransitionend.bind(this))
  }

  public connectedCallback(): void {
    this.toggleAttribute('data-disconnected', false)
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  public disconnectedCallback(): void {
    this.toggleAttribute('data-disconnected', true)
    this.state?.unregister(this)
    this.escape.unregister(this.closeBound)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  public override show(): void {
    super.show()
    this.updateZIndex()
    this.resetOutputs()
    this.escape.register(this.closeBound)
    this.commander.execute('show')
  }

  public override showModal(): void {
    super.showModal()
    this.resetOutputs()
    this.escape.register(this.closeBound)
    this.commander.execute('show')
  }

  public stateChangedCallback(newValues: Partial<StateValues>, oldValues?: Partial<StateValues>): void {
    this.commander.executeState(newValues, oldValues)
  }

  protected findMaxZIndex(): number {
    const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'))

    return dialogs.reduce((zIndex, dialog) => {
      return Math.max(zIndex, Number(dialog.style.getPropertyValue('z-index')))
    }, 0)
  }

  protected findOutputElements(): HTMLOutputElement[] {
    return [
      ...Array.from(document.querySelectorAll('output')),
      ...Array.from(this.querySelectorAll('output')),
    ]
  }

  protected findParentElement(): HTMLElement {
    return Array
      .from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'))
      .pop() ?? document.body
  }

  protected handleCancel(event: Event): void {
    event.preventDefault()
  }

  protected handleClose(): void {
    if (window.getComputedStyle(this).display === 'none') {
      this.commander.execute('close')
    }

    this.updateZIndex()
    this.resetOutputs()
    this.escape.unregister(this.closeBound)
  }

  protected handleFocus(): void {
    this.escape.unregister(this.closeBound)
    this.escape.register(this.closeBound)
    this.updateZIndex()
  }

  protected handleTransitionend(event: TransitionEvent): void {
    if (
      event.propertyName === 'display' &&
      window.getComputedStyle(this).display === 'none'
    ) {
      this.commander.execute('close')
    }
  }

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

  protected updateZIndex(): void {
    if (this.open) {
      this.style.setProperty('z-index', `${this.findMaxZIndex() + 3}`)
    } else {
      this.style.removeProperty('z-index')
    }
  }
}
