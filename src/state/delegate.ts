import type { Delegate } from '../delegator/index.js'
import { customStates } from './custom-registry.js'
import { StateStore, type StateStoreAsync, type StateStoreSync } from './store.js'

export interface StateDetail<NewValue = unknown, OldValue = unknown> {
  field?: string
  key: string
  newValue?: NewValue
  oldValue?: OldValue
  type: string
}

export type StateStores = Record<string, StateStoreAsync | StateStoreSync>

export class State<Values = unknown> implements Delegate {
  static attributeNames = {
    name: 'data-state',
    store: 'data-state-store',
  }

  static name = 'state'

  static stores: StateStores = {
    local: new StateStore(localStorage),
    session: new StateStore(sessionStorage),
  }

  loaded?: Promise<void>

  #elements = new Set<HTMLElement>()

  #name: string

  #store?: string

  #values: Record<string, unknown> = {}

  constructor(name = 'state', store?: string) {
    this.#name = name
    this.#store = store
  }

  static create<Values = unknown>(name: string, store?: string): State<Values> {
    let state = customStates.get<Values>(name)

    if (state === undefined) {
      state = new State<Values>(name, store)
      customStates.define(name, state)
    }

    state.load()

    return state
  }

  static createFromElement(element: HTMLElement): State | undefined {
    const name = element.getAttribute(State.attributeNames.name)
    const store = element.getAttribute(State.attributeNames.store) ?? undefined

    if (name === null) {
      return undefined
    }

    return State.create(name, store)
  }

  connect(element: HTMLElement): void {
    this.#elements.add(element)
  }

  del<Key extends keyof Values & string>(key: Key): StateDetail | undefined {
    if (!this.exists(key)) {
      return undefined
    }

    const oldValue = this.#values[key]

    delete this.#values[key]
    this.save()

    const detail: StateDetail = {
      key,
      oldValue,
      type: 'del',
    }

    this.dispatchEvents(detail)

    return detail
  }

  disconnect(element: HTMLElement): void {
    this.#elements.delete(element)
  }

  dispatchError(error: unknown): void {
    this.dispatchEvent(new CustomEvent('stateerror', {
      detail: error,
    }))
  }

  dispatchEvent(event: CustomEvent): void {
    for (const element of this.#elements) {
      element.dispatchEvent(event)
    }
  }

  dispatchEvents(detail: StateDetail): void {
    const key = detail.key.replace(/\W/gu, '').toLowerCase()

    this.dispatchEvent(new CustomEvent(`${detail.type}${key}`, {
      detail,
    }))

    this.dispatchEvent(new CustomEvent(`${key}change`, {
      detail,
    }))

    this.dispatchEvent(new CustomEvent('statechange', {
      detail,
    }))
  }

  exists<Key extends keyof Values & string>(key: Key): boolean {
    return Object.hasOwn(this.#values, key)
  }

  get<Key extends keyof Values & string>(key: Key): undefined | Values[Key] {
    return this.#values[key] as undefined | Values[Key]
  }

  hdel<Key extends keyof Values & string, Field extends keyof Values[Key] & string>(key: Key, field: Field): StateDetail | undefined {
    if (!this.hexists(key, field)) {
      return undefined
    }

    const object = (this.#values[key] ?? {}) as Record<string, unknown>
    const oldValue = object[field]

    delete object[field]
    this.#values[key] = object
    this.save()

    const detail: StateDetail = {
      field,
      key,
      oldValue,
      type: 'hdel',
    }

    this.dispatchEvents(detail)

    return detail
  }

  hexists<Key extends keyof Values & string, Field extends keyof Values[Key] & string>(key: Key, field: Field): boolean {
    return Object.hasOwn(this.#values, key) && Object.hasOwn(this.#values[key] as Record<string, unknown>, field)
  }

  hget<Key extends keyof Values & string, Field extends keyof Values[Key] & string>(key: Key, field: Field): undefined | Values[Key][Field] {
    if (!this.hexists(key, field)) {
      return undefined
    }

    return (this.#values[key] as Record<string, unknown>)[field] as undefined | Values[Key][Field]
  }

  hset<Key extends keyof Values & string, Field extends keyof Values[Key] & string>(key: Key, field: Field, value: Values[Key][Field]): StateDetail | undefined {
    const object = (this.#values[key] ?? {}) as Record<string, unknown>
    const oldValue = object[field]

    object[field] = value
    this.#values[key] = object
    this.save()

    const detail: StateDetail = {
      field,
      key,
      newValue: value,
      oldValue,
      type: 'hset',
    }

    this.dispatchEvents(detail)

    return detail
  }

  hsetnx<Key extends keyof Values & string, Field extends keyof Values[Key] & string>(key: Key, field: Field, value: Values[Key][Field]): StateDetail | undefined {
    if (this.hexists(key, field)) {
      return undefined
    }

    const object = (this.#values[key] ?? {}) as Record<string, unknown>
    const oldValue = object[field]

    object[field] = value
    this.#values[key] = object
    this.save()

    const detail: StateDetail = {
      field,
      key,
      newValue: value,
      oldValue,
      type: 'hsetnx',
    }

    this.dispatchEvents(detail)

    return detail
  }

  load(): void {
    if (
      this.#store !== undefined &&
      this.loaded === undefined
    ) {
      if (State.stores[this.#store].sync) {
        try {
          this.#values = (State.stores[this.#store] as StateStoreSync).load(this.#name)
          this.loaded = Promise.resolve()
        } catch (error) {
          this.dispatchError(error)
        }
      } else {
        this.loaded = (State.stores[this.#store] as StateStoreAsync)
          .load(this.#name)
          .then((values) => {
            this.#values = values
          })
          .catch((error: unknown) => {
            this.dispatchError(error)
          })
      }
    }
  }

  lpos<Key extends keyof Values & string>(key: Key, value: Values[Key] extends unknown[] ? Values[Key][number] : Values[Key]): number {
    const list = this.#values[key]

    return Array.isArray(list) ? list.indexOf(value) : -1
  }

  lpush<Key extends keyof Values & string>(key: Key, value: Values[Key] extends unknown[] ? Values[Key][number] : Values[Key]): StateDetail | undefined {
    const list = (this.#values[key] ?? []) as unknown[]

    list.push(value)
    this.#values[key] = list
    this.save()

    const detail: StateDetail = {
      key,
      newValue: value,
      type: 'lpush',
    }

    this.dispatchEvents(detail)

    return detail
  }

  lrem<Key extends keyof Values & string>(key: Key, value: Values[Key] extends unknown[] ? Values[Key][number] : Values[Key]): StateDetail | undefined {
    const index = this.lpos(key, value)

    if (index === -1) {
      return undefined
    }

    const list = (this.#values[key] ?? []) as unknown[]
    const oldValue = list[index]

    list.splice(index, 1)
    this.#values[key] = list
    this.save()

    const detail: StateDetail = {
      key,
      newValue: value,
      oldValue,
      type: 'lrem',
    }

    this.dispatchEvents(detail)

    return detail
  }

  lset<Key extends keyof Values & string>(key: Key, index: number, value: Values[Key] extends unknown[] ? Values[Key][number] : Values[Key]): StateDetail | undefined {
    const list = (this.#values[key] ?? []) as unknown[]
    const oldValue = list[index]

    list[index] = value
    this.#values[key] = list
    this.save()

    const detail: StateDetail = {
      key,
      newValue: value,
      oldValue,
      type: 'lset',
    }

    this.dispatchEvents(detail)

    return detail
  }

  save(): void {
    if (this.#store !== undefined) {
      if (State.stores[this.#store].sync) {
        try {
          (State.stores[this.#store] as StateStoreSync).save(this.#name, this.#values)
        } catch (error) {
          this.dispatchError(error)
        }
      } else {
        (State.stores[this.#store] as StateStoreAsync).save(this.#name, this.#values).catch((error: unknown) => {
          this.dispatchError(error)
        })
      }
    }
  }

  set<Key extends keyof Values & string>(key: Key, value: Values[Key]): StateDetail {
    const oldValue = this.#values[key]

    this.#values[key] = value
    this.save()

    const detail: StateDetail = {
      key,
      newValue: value,
      oldValue,
      type: 'set',
    }

    this.dispatchEvents(detail)

    return detail
  }

  setnx<Key extends keyof Values & string>(key: Key, value: Values[Key]): StateDetail | undefined {
    if (this.exists(key)) {
      return undefined
    }

    const oldValue = this.#values[key]

    this.#values[key] = value
    this.save()

    const detail: StateDetail = {
      key,
      newValue: value,
      oldValue,
      type: 'setnx',
    }

    this.dispatchEvents(detail)

    return detail
  }
}
