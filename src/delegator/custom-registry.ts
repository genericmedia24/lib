import { type DelegateSpec, Delegator } from './delegator.js'

export class CustomDelegateRegistry {
  #delegates: DelegateSpec[] = []

  define(name: DelegateSpec['name'], delegate: DelegateSpec['delegate'], create: DelegateSpec['create'] = Delegator.defaultCreateFromElement): void {
    this.#delegates.push({
      create,
      delegate,
      name,
    })
  }

  get(name: string): DelegateSpec | undefined {
    return this.#delegates.find((delegate) => {
      return delegate.name === name
    })
  }

  getAll(): DelegateSpec[] {
    return this.#delegates
  }
}

export const customDelegates = new CustomDelegateRegistry()
