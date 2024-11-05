import isEqual from 'fast-deep-equal'
import * as idb from 'idb-keyval'
import type { StatefulElement } from './stateful.js'

export interface StateOptions {
  name: string
  storage?: State['storage']
  values?: Record<string, unknown>
}

export class State<StateValues = Record<string, unknown>> {
  private static readonly instances = new Map<string, State>()

  public static create<StateValues = Record<string, unknown>>(options: StateOptions): State<StateValues> {
    let state = State.instances.get(options.name) as State<StateValues> | undefined

    if (state === undefined) {
      state = new State(options)
      State.instances.set(options.name, state as State)
      state.load()
    }

    return state
  }

  public static setup<StateValues = Record<string, unknown>>(element: StatefulElement<StateValues>): State<StateValues> | undefined {
    if (element.dataset.state !== undefined) {
      return State.create<StateValues>({
        name: element.dataset.state,
        storage: element.dataset.stateStorage as State['storage'],
        values: Object.fromEntries(new URLSearchParams(element.dataset.stateValues)),
      })
    }

    return undefined
  }

  public elements = new Set<StatefulElement<StateValues>>()

  public loaded?: Promise<void>

  public name: string

  public storage: 'idb' | 'local' | 'none' = 'local'

  public values: Map<string, unknown>

  public get storageKey(): string {
    return `state-${this.name}`
  }

  private constructor(options: StateOptions) {
    this.name = options.name
    this.storage = options.storage ?? 'local'
    this.values = new Map(Object.entries(options.values ?? {}))
  }

  public clear(): this {
    this.values.clear()

    if (this.storage === 'local') {
      window.localStorage.removeItem(this.storageKey)
    } else {
      idb
        .del(this.storageKey)
        .catch(() => {})
    }

    return this
  }

  public delete<Key extends keyof StateValues & string>(key: Key): boolean {
    if (!this.values.has(key)) {
      return false
    }

    const newValues = {
      [key]: undefined,
    } as StateValues

    const oldValues = {
      [key]: this.values.get(key),
    } as StateValues

    const result = this.values.delete(key)

    this.elements.forEach((element) => {
      element.stateChangedCallback(newValues, oldValues)
    })

    this.save()
    return result
  }

  public deleteAll(keys?: Array<keyof StateValues & string>): this {
    let newValues = {}
    let oldValues = {}

    const allKeys = keys ?? Array.from(this.values.keys())

    allKeys.forEach((key) => {
      if (!this.values.has(key)) {
        return
      }

      const oldValue = this.values.get(key)

      newValues = {
        ...newValues,
        [key]: undefined,
      }

      oldValues = {
        ...oldValues,
        [key]: oldValue,
      }

      this.values.delete(key)
    })

    this.elements.forEach((element) => {
      element.stateChangedCallback(newValues, oldValues)
    })

    this.save()
    return this
  }

  public get<Key extends keyof StateValues & string>(key: Key): StateValues[Key] | undefined {
    return this.values.get(key) as StateValues[Key]
  }

  public getAll(): Partial<StateValues> {
    return Object.fromEntries(this.values.entries()) as Partial<StateValues>
  }

  public has<Key extends keyof StateValues & string>(key: Key): boolean {
    return this.values.has(key)
  }

  public load(): this {
    if (this.loaded === undefined) {
      if (this.storage === 'idb') {
        this.loaded = idb
          .get(this.storageKey)
          .then((values: string | undefined) => {
            if (values !== undefined) {
              this.values = new Map(JSON.parse(values) as Array<[string, unknown]>)
            }
          })
          .catch((error: unknown) => {
            console.error(error)
          })
      } else if (this.storage === 'local') {
        try {
          const values = window.localStorage.getItem(this.storageKey)

          if (values !== null) {
            this.values = new Map(JSON.parse(values) as Array<[string, unknown]>)
          }

          this.loaded = Promise.resolve()
        } catch (error: unknown) {
          console.error(error)
        }
      }
    }

    return this
  }

  public register(element: StatefulElement<StateValues>): void {
    this.elements.add(element)
  }

  public save(): this {
    if (this.storage === 'idb') {
      idb
        .set(this.storageKey, JSON.stringify(Array.from(this.values)))
        .catch(() => {})
    } else if (this.storage === 'local') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.values)))
    }

    return this
  }

  public set<Key extends keyof StateValues & string>(key: Key, value: StateValues[Key]): this {
    const oldValue = this.values.get(key)

    if (isEqual(value, oldValue)) {
      return this
    }

    const newValues = {
      [key]: value,
    } as StateValues

    const oldValues = {
      [key]: oldValue,
    } as StateValues

    this.values.set(key, value)

    this.elements.forEach((element) => {
      element.stateChangedCallback(newValues, oldValues)
    })

    this.save()
    return this
  }

  public setAll(values: Partial<StateValues>): this {
    let newValues = {}
    let oldValues = {}

    Object
      .entries(values)
      .forEach(([key, value]) => {
        const oldValue = this.values.get(key)

        if (isEqual(value, oldValue)) {
          return
        }

        newValues = {
          ...newValues,
          [key]: value,
        }

        oldValues = {
          ...oldValues,
          [key]: oldValue,
        }

        this.values.set(key, value)
      })

    this.elements.forEach((element) => {
      element.stateChangedCallback(newValues, oldValues)
    })

    this.save()
    return this
  }

  public setnx<Key extends keyof StateValues & string>(key: Key, value: StateValues[Key]): this {
    if (!this.has(key)) {
      this.set(key, value)
    }

    return this
  }

  public unload(): void {
    this.loaded = undefined
    this.values.clear()
  }

  public unregister(element: StatefulElement<StateValues>): void {
    this.elements.delete(element)
  }
}
