export class EscapeTrap {
  #handleKeydownBound = this.#handleKeydown.bind(this)

  #stack: Array<() => void> = []

  add(...callbacks: Array<() => void>): void {
    this.#stack.push(...callbacks)
  }

  delete(...callbacks: Array<() => void>): void {
    for (const callback of callbacks) {
      const index = this.#stack.indexOf(callback)

      if (index > -1) {
        this.#stack.splice(index, 1)
      }
    }
  }

  disconnect(): void {
    window.removeEventListener('keydown', this.#handleKeydownBound)
  }

  observe(): void {
    window.addEventListener('keydown', this.#handleKeydownBound)
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault()
      this.#stack.pop()?.()
    }
  }
}

export const escapeTrap = new EscapeTrap()
