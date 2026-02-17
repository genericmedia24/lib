export interface MoveEvent {
  clientX: number
  clientX0: number
  clientY: number
  clientY0: number
  directionX: string
  directionY: string
  dx: number
  dy: number
  t: number
  t0: number
  type: string
}

export class MoveObserver {
  #callback: (event: MoveEvent) => void

  #directionX = 'none'

  #directionY = 'none'

  #firstEvent?: PointerEvent

  #handlePointerDownBound = this.#handlePointerDown.bind(this)

  #handlePointerMoveBound = this.#handlePointerMove.bind(this)

  #handlePointerUpBound = this.#handlePointerUp.bind(this)

  #lastEvent?: PointerEvent

  #parentElement?: HTMLElement

  #targetElement!: HTMLElement

  constructor(callback: (event: MoveEvent) => void) {
    this.#callback = callback
  }

  disconnect(): void {
    this.#targetElement.removeEventListener('pointerdown', this.#handlePointerDownBound)
  }

  observe(targetElement: HTMLElement, parentElement?: HTMLElement): void {
    this.#targetElement = targetElement
    this.#parentElement = parentElement
    this.#targetElement.addEventListener('pointerdown', this.#handlePointerDownBound)
  }

  #createEvent(type: string, event: PointerEvent): MoveEvent {
    return {
      clientX: event.clientX,
      clientX0: this.#firstEvent?.clientX ?? 0,
      clientY: event.clientY,
      clientY0: this.#firstEvent?.clientY ?? 0,
      directionX: this.#directionX,
      directionY: this.#directionY,
      dx: event.clientX - (this.#lastEvent?.clientX ?? event.clientX),
      dy: event.clientY - (this.#lastEvent?.clientY ?? event.clientY),
      t: event.timeStamp,
      t0: this.#firstEvent?.timeStamp ?? 0,
      type,
    }
  }

  #handlePointerDown(event: PointerEvent): void {
    if (event.button === 0) {
      this.#firstEvent = event
      this.#directionX = 'none'
      this.#directionY = 'none'
      this.#targetElement.style.setProperty('user-select', 'none')
      this.#callback(this.#createEvent('down', event))
      window.addEventListener('pointermove', this.#handlePointerMoveBound)
      window.addEventListener('pointerup', this.#handlePointerUpBound)
    }
  }

  #handlePointerMove(event: PointerEvent): void {
    if (this.#firstEvent === undefined) {
      return
    }

    const moveEvent = this.#createEvent('move', event)

    this.#lastEvent = event

    this.#directionX = moveEvent.dx > 0
      ? 'right'
      : moveEvent.dy < 0
        ? 'left'
        : 'none'

    this.#directionY = moveEvent.dy > 0
      ? 'down'
      : moveEvent.dy < 0
        ? 'up'
        : this.#directionY

    if (this.#parentElement === undefined) {
      this.#callback(moveEvent)
    } else {
      const parentRect = this.#parentElement.getBoundingClientRect()
      const targetRect = this.#targetElement.getBoundingClientRect()

      if (
        event.clientX < parentRect.left + (targetRect.width / 2) ||
        targetRect.left + moveEvent.dx < parentRect.left
      ) {
        moveEvent.dx = parentRect.left - targetRect.left
      } else if (
        event.clientX > parentRect.right - (targetRect.width / 2) ||
        targetRect.left + moveEvent.dx + targetRect.width > parentRect.right
      ) {
        moveEvent.dx = parentRect.right - targetRect.right
      }

      if (
        event.clientY < parentRect.top + (targetRect.height / 2) ||
        targetRect.top + moveEvent.dy < parentRect.top
      ) {
        moveEvent.dy = parentRect.top - targetRect.top
      } else if (
        event.clientY > parentRect.bottom - (targetRect.height / 2) ||
        targetRect.top + moveEvent.dy + targetRect.height > parentRect.bottom
      ) {
        moveEvent.dy = parentRect.bottom - targetRect.bottom
      }

      this.#callback(moveEvent)
    }
  }

  #handlePointerUp(event: PointerEvent): void {
    this.#callback(this.#createEvent('up', event))
    this.#firstEvent = undefined
    this.#lastEvent = undefined
    this.#directionX = 'none'
    this.#directionY = 'none'
    this.#targetElement.style.removeProperty('user-select')
    window.removeEventListener('pointermove', this.#handlePointerMoveBound)
    window.removeEventListener('pointerup', this.#handlePointerUpBound)
  }
}
