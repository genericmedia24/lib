export class TabTrap {
  #element: HTMLElement

  #handleKeydownBound = this.#handleKeydown.bind(this)

  #stack: HTMLElement[] = []

  constructor(element: HTMLElement) {
    this.#element = element
  }

  add(...elements: unknown[]): void {
    for (const element of elements) {
      if (element instanceof HTMLElement) {
        this.#stack.push(element)
      }
    }
  }

  delete(...elements: unknown[]): void {
    for (const element of elements) {
      if (element instanceof HTMLElement) {
        const index = this.#stack.indexOf(element)

        if (index > -1) {
          this.#stack.splice(index, 1)
        }
      }
    }
  }

  disconnect(): void {
    this.#element.removeEventListener('keydown', this.#handleKeydownBound)
  }

  observe(): void {
    this.#element.addEventListener('keydown', this.#handleKeydownBound)
  }

  #handleKeydown(event: KeyboardEvent): void {
    const visibleStack = this.#stack.filter((element) => {
      return element.checkVisibility()
    })

    if (event.code === 'Tab') {
      if (event.shiftKey) {
        if (event.target === visibleStack.at(0)) {
          event.preventDefault()
          visibleStack.at(-1)?.focus()
        }
      } else if (event.target === visibleStack.at(-1)) {
        event.preventDefault()
        visibleStack.at(0)?.focus()
      }
    }
  }
}
