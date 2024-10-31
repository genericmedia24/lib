import interact from 'interactjs'
import { Element } from './element.js'

export class ResizerElement extends Element {
  public interact?: Interact.Interactable

  protected handleDblclickBound = this.handleDblclick.bind(this)

  protected handleMousedownBound = this.handleMousedown.bind(this)

  protected handleMouseupBound = this.handleMouseup.bind(this)

  protected handleMoveBound = this.handleMove.bind(this)

  public override connectedCallback(): void {
    this.interact = interact(this, {
      drag: {
        listeners: {
          move: this.handleMoveBound,
        },
      },
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
        }),
      ],
      styleCursor: false,
    })

    this.addEventListener('dblclick', this.handleDblclickBound)
    this.addEventListener('mousedown', this.handleMousedownBound)

    this.setCommands()
    super.connectedCallback()
  }

  public override disconnectedCallback(): void {
    this.interact?.unset()
    this.removeEventListener('dblclick', this.handleDblclickBound)
    this.removeEventListener('mousedown', this.handleMousedownBound)
    super.disconnectedCallback()
  }

  protected handleDblclick(event: MouseEvent): void {
    this.commander.execute('dblclick', {
      event,
    })
  }

  protected handleMousedown(event: MouseEvent): void {
    event.preventDefault()
    document.body.style.setProperty('cursor', window.getComputedStyle(this).getPropertyValue('cursor'))
    this.classList.add('active')
    window.addEventListener('mouseup', this.handleMouseupBound)
  }

  protected handleMouseup(event: MouseEvent): void {
    event.preventDefault()
    document.body.style.removeProperty('cursor')
    this.classList.remove('active')
    window.removeEventListener('mouseup', this.handleMouseupBound)
  }

  protected handleMove(event: Interact.InteractEvent): void {
    this.commander.execute('move', {
      event,
    })
  }

  protected setCommands(): void {
    if (
      this.dataset.axis !== undefined &&
      this.dataset.target !== undefined
    ) {
      if (this.dataset.ondblclick === undefined) {
        this.dataset.ondblclick = `element-resize@${this.dataset.target}?axis=${this.dataset.axis}&auto=true`
      }

      if (this.dataset.onmove === undefined) {
        this.dataset.onmove = `element-resize@${this.dataset.target}?axis=${this.dataset.axis}`
      }
    }
  }
}
