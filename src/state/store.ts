export interface StateStoreAsync {
  load: (key: string) => Promise<Record<string, unknown>>
  save: (key: string, value: Record<string, unknown>) => Promise<void>
  sync: boolean
}

export interface StateStoreSync {
  load: (key: string) => Record<string, unknown>
  save: (key: string, value: Record<string, unknown>) => void
  sync: boolean
}

export class StateStore implements StateStoreSync {
  sync = true

  #storage: Storage

  constructor(storage: Storage) {
    this.#storage = storage
  }

  load(key: string): Record<string, unknown> {
    return JSON.parse(this.#storage.getItem(key) ?? '{}') as Record<string, unknown>
  }

  save(key: string, value: Record<string, unknown>): void {
    this.#storage.setItem(key, JSON.stringify(value))
  }
}
