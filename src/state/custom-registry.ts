import type { State } from './delegate.js'

export class CustomStateRegistry {
  #states = new Map<string, State>()

  define(name: string, delegate: State): void {
    this.#states.set(name, delegate)
  }

  get<Values = unknown>(name: string): State<Values> | undefined {
    return this.#states.get(name) as State<Values>
  }

  getAll(): Map<string, State> {
    return this.#states
  }
}

export const customStates = new CustomStateRegistry()
