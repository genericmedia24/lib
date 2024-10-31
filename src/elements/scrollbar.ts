import interact from 'interactjs'
import { Element } from './element.js'

export class ScrollbarElement extends Element {
  public interact?: Interact.Interactable

  public mutationObserver: MutationObserver

  public resizeObserver: ResizeObserver

  public targetElement: HTMLElement = this

  public thumbElement: HTMLElement = this

  protected handleMousedownBound = this.handleMousedown.bind(this)

  protected handleMouseupBound = this.handleMouseup.bind(this)

  protected handleMoveBound = this.handleMove.bind(this)

  protected handleMutationBound = this.handleMutation.bind(this)

  protected handleResizeBound = this.handleResize.bind(this)

  protected handleScrollBound = this.handleScroll.bind(this)

  protected handleWheelBound = this.handleWheel.bind(this)

  public constructor() {
    super()
    this.mutationObserver = new MutationObserver(this.handleMutationBound)
    this.resizeObserver = new ResizeObserver(this.handleResizeBound)
  }

  public override connectedCallback(): void {
    if (!window.matchMedia('(hover: hover)').matches) {
      this.style.setProperty('display', 'none')
      return
    }

    const target = this.dataset.target === undefined
      ? undefined
      : document.getElementById(this.dataset.target) ?? undefined

    if (target === undefined) {
      throw new Error('Target is undefined')
    }

    this.targetElement = target

    this.thumbElement = this.thumbElement === this
      ? this.appendChild(document.createElement('div'))
      : this.thumbElement

    this.interact = interact(this.thumbElement, {
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

    this.mutationObserver.observe(this.targetElement, {
      childList: true,
    })

    this.targetElement.style.setProperty('scrollbar-width', 'none')
    this.targetElement.addEventListener('scroll', this.handleScrollBound)
    this.targetElement.addEventListener('wheel', this.handleWheelBound)

    this.addEventListener('mousedown', this.handleMousedownBound)
    this.addEventListener('wheel', this.handleWheelBound)

    this.handleMutation()
    this.setCommands()

    super.connectedCallback()
  }

  public override disconnectedCallback(): void {
    this.interact?.unset()
    this.mutationObserver.disconnect()
    this.resizeObserver.disconnect()

    this.targetElement.style.removeProperty('scrollbar-width')
    this.targetElement.removeEventListener('scroll', this.handleScrollBound)
    this.targetElement.removeEventListener('wheel', this.handleWheelBound)

    this.removeEventListener('mousedown', this.handleMousedownBound)
    this.removeEventListener('wheel', this.handleWheelBound)

    super.disconnectedCallback()
  }

  protected handleMousedown(event: MouseEvent): void {
    event.preventDefault()

    this.classList.add('active')
    window.addEventListener('mouseup', this.handleMouseupBound)

    this.commander.execute('mousedown', {
      event,
    })
  }

  protected handleMouseup(event: MouseEvent): void {
    event.preventDefault()

    this.classList.remove('active')
    window.removeEventListener('mouseup', this.handleMouseupBound)

    this.commander.execute('mouseup', {
      event,
    })
  }

  protected handleMove(event: Interact.InteractEvent): void {
    this.commander.execute('move', {
      event,
    })
  }

  protected handleMutation(): void {
    this.resizeObserver.disconnect()
    this.resizeObserver.observe(this.targetElement)

    Array
      .from(this.targetElement.children)
      .forEach((element) => {
        this.resizeObserver.observe(element)
      })
  }

  protected handleResize(entries: ResizeObserverEntry[]): void {
    this.commander.execute('resize', {
      entries,
    })
  }

  protected handleScroll(event: Event): void {
    this.commander.execute('scroll', {
      event,
    })
  }

  protected handleWheel(event: WheelEvent): void {
    if (
      this.targetElement.scrollWidth > this.targetElement.offsetWidth &&
      this.targetElement.scrollHeight === this.targetElement.offsetHeight &&
      event.deltaX === 0 &&
      event.deltaY !== 0
    ) {
      event.preventDefault()
      this.targetElement.scrollLeft += event.deltaY / 3
    } else if (
      event.target === this ||
      event.target === this.thumbElement
    ) {
      event.preventDefault()

      this.targetElement.scrollTo({
        left: this.targetElement.scrollLeft + event.deltaX,
        top: this.targetElement.scrollTop + event.deltaY,
      })
    }
  }

  protected setCommands(): void {
    if (
      this.dataset.axis !== undefined &&
      this.dataset.target !== undefined
    ) {
      if (this.dataset.onmousedown === undefined) {
        this.dataset.onmousedown = `element-scroll@${this.dataset.target}?axis=${this.dataset.axis}&update=thumb`
      }

      if (this.dataset.onmove === undefined) {
        this.dataset.onmove = `element-scroll@${this.dataset.target}?axis=${this.dataset.axis}`
      }

      if (this.dataset.onresize === undefined) {
        this.dataset.onresize = `element-scroll@${this.dataset.target}?axis=${this.dataset.axis}&update=dimension,position`
      }

      if (this.dataset.onscroll === undefined) {
        this.dataset.onscroll = `element-scroll@${this.dataset.target}?axis=${this.dataset.axis}&update=position`
      }
    }
  }
}
