import type { Delegate } from './delegate.js'
import type { DelegateElement } from './element.js'
import { customDelegates } from './custom-registry.js'

export interface DelegateSpec {
  create: (element: HTMLElement, spec: DelegateSpec) => Delegate | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delegate: Delegate & (new(...args: any[]) => Delegate)
  name: string
}

export class Delegator {
  static attributeNames = {
    delegates: 'data-delegate',
  }

  #delegates!: DelegateSpec[]

  #observer?: MutationObserver

  static defaultCreateFromElement(this: void, element: HTMLElement, spec: DelegateSpec): Delegate | undefined {
    return element
      .getAttribute(Delegator.attributeNames.delegates)
      ?.includes(spec.name) === true
      ? new spec.delegate()
      : undefined
  }

  observe(): void {
    if (this.#observer === undefined) {
      this.#delegates = customDelegates.getAll()

      this.#observer = new MutationObserver((mutations) => {
        for (let { length } = mutations, i = 0, mutation; i < length; i += 1) {
          mutation = mutations[i]
          this.#connectNodes(mutation.addedNodes)
          this.#disconnectNodes(mutation.removedNodes)
        }
      })

      this.#observer.observe(document, {
        childList: true,
        subtree: true,
      })

      const nodes = document.querySelectorAll('*')

      for (let { length } = nodes, element, i = 0; i < length; i += 1) {
        element = nodes[i] as DelegateElement

        if (element.nodeType === 1) {
          this.#connectElement(element)
        }
      }
    }
  }

  #connectElement(element: DelegateElement): void {
    for (let { length } = this.#delegates, delegate, i = 0, spec; i < length; i += 1) {
      spec = this.#delegates[i]
      delegate = spec.create(element, spec)

      if (delegate !== undefined) {
        element[spec.name] ??= delegate
        element[spec.name]?.connect?.(element)
      }
    }
  }

  #connectNodes(nodes: NodeList): void {
    for (let { length } = nodes, child, element, i = 0; i < length; i += 1) {
      element = nodes[i] as DelegateElement

      if (element.nodeType === 1) {
        this.#connectElement(element)

        if (element.hasChildNodes()) {
          const children = element.querySelectorAll('*')

          for (let j = 0; j < children.length; j += 1) {
            child = children[j] as DelegateElement

            if (child.nodeType === 1) {
              this.#connectElement(child)
            }
          }
        }
      }
    }
  }

  #disconnectElement(element: DelegateElement): void {
    for (let i = 0; i < this.#delegates.length; i += 1) {
      element[this.#delegates[i].name]?.disconnect?.(element)
    }
  }

  #disconnectNodes(nodes: NodeList): void {
    for (let { length } = nodes, child, element, i = 0; i < length; i += 1) {
      element = nodes[i] as DelegateElement

      if (element.nodeType === 1) {
        this.#disconnectElement(element)

        if (element.hasChildNodes()) {
          const children = element.querySelectorAll('*')

          for (let j = 0; j < children.length; j += 1) {
            child = children[j] as DelegateElement

            if (child.nodeType === 1) {
              this.#disconnectElement(child)
            }
          }
        }
      }
    }
  }
}

export const delegator = new Delegator()
