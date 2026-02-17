import type { Delegate } from '../delegator/index.js'

export class History implements Delegate {
  static attributeNames = {
    create: 'data-history',
  }

  static name = 'history'

  element!: HTMLElement

  index = -1

  stack: Element[][] = []

  static createFromElement(element: HTMLElement): History | undefined {
    return element.hasAttribute(History.attributeNames.create)
      ? new History()
      : undefined
  }

  back(): void {
    this.go(-1)
  }

  connect(element: HTMLElement): void {
    this.element = element
  }

  disconnect(): void {
    this.stack = []
  }

  forward(): void {
    this.go(1)
  }

  go(delta: number): void {
    this.goto(this.index + delta)
  }

  goto(index: number): void {
    if (
      index < 0 ||
      index > this.stack.length - 1 ||
      index === this.index
    ) {
      return
    }

    const event = index < this.index
      ? 'historyback'
      : 'historyforward'

    this.index = index
    this.element.innerHTML = ''

    this.stack[this.index].forEach((childElement) => {
      this.element.appendChild(childElement)
    })

    this.#dispatchEvent('history')
    this.#dispatchEvent(event)
  }

  push(html: string): void {
    this.element.innerHTML = html
    this.stack = this.stack.slice(0, this.index + 1)
    this.stack.push(Array.from(this.element.children))
    this.index = this.stack.length - 1
    this.#dispatchEvent('history')
    this.#dispatchEvent('historyforward')
  }

  #dispatchEvent(type: string): void {
    this.element.dispatchEvent(new CustomEvent(type, {
      detail: this.index,
    }))
  }
}
