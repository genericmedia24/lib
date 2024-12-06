import isEqual from 'fast-deep-equal'
import * as idb from 'idb-keyval'
import type { StatefulElement } from './stateful-element.js'

export interface StateOptions {
  /**
   * The name of the state.
   */
  name: string

  /**
   * The name of the storage provider of the state.
   */
  storage?: State['storage']

  /**
   * The initial values of the state. These values will be overridden when `state.load` is called.
   */
  values?: Record<string, unknown>
}

/**
 * State.
 *
 * @example
 * ```javascript
 * const state = new State({
 *   name: 'test'
 * })
 *
 * state.set('some-key', 'some-value')
 * console.log(state.get('some-key') === 'some-value') // true
 *
 * state.delete('some-key')
 * console.log(state.get('some-key') === undefined) // true
 * ```
 */
export class State<StateValues = Record<string, unknown>> {
  /**
   * The singleton states.
   */
  public static readonly instances = new Map<string, State>()

  /**
   * Creates a singleton state. For every name there is one state.
   *
   * Calls `load` once, after creating the state.
   *
   * @param options the options
   */
  public static create<StateValues = Record<string, unknown>>(options: StateOptions): State<StateValues> {
    let state = State.instances.get(options.name) as State<StateValues> | undefined

    if (state === undefined) {
      state = new State(options)
      State.instances.set(options.name, state as State)
      state.load()
    }

    return state
  }

  /**
   * Sets up a state.
   *
   * Uses the dataset of the element to determine the options.
   *
   * @example
   * ```html
   * <div id="div" is="gm-div" data-state="test" data-state-storage="idb" data-state-values="some-key=some-value&other-key=other-value"></div>
   * ```
   *
   * ```javascript
   * const state = State.setup(document.getElementById('div'))
   *
   * console.log(state.name === 'test') // true
   * console.log(state.storage === 'idb') // true
   * console.log(state.values.get('other-key') === 'other-value') // true
   * ```
   *
   * @param element the element
   */
  public static setup<StateValues = Record<string, unknown>>(element: StatefulElement<StateValues>): State<StateValues> | undefined {
    if (element.dataset.state !== undefined) {
      return State.create<StateValues>({
        name: element.dataset.state,
        storage: element.dataset.stateStorage as State['storage'],
        values: Object.fromEntries(new window.URLSearchParams(element.dataset.stateValues)),
      })
    }

    return undefined
  }

  /**
   * The elements that have been registered.
   */
  public elements = new Set<StatefulElement<StateValues>>()

  /**
   * Whether the values have been loaded from the storage provider.
   */
  public loaded?: Promise<void>

  /**
   * The name of the state.
   */
  public name: string

  /**
   * The name of the storage provider of the state.
   */
  public storage: 'idb' | 'local' | 'none' = 'local'

  /**
   * The values of the state.
   */
  public values: Map<string, unknown>

  /**
   * Creates a storage key based on the name of the state.
   */
  public get storageKey(): string {
    return `state-${this.name}`
  }

  /**
   * Creates a state.
   *
   * @param options the options
   */
  public constructor(options: StateOptions) {
    this.name = options.name
    this.storage = options.storage ?? 'local'
    this.values = new Map(Object.entries(options.values ?? {}))
  }

  /**
   * Clears the values, both of the state and in the storage provider.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   * console.log(state.get('some-key') === 'some-value') // true
   *
   * state.clear()
   * console.log(state.get('some-key') === undefined) // true
   * ```
   */
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

  /**
   * Deletes the value of the given key.
   *
   * Calls `stateChangedCallback` of all the registered elements. Saves the values to the storage provider.
   *
   * The newValues object passed to the callback contains the key of the deleted value with the value set to `undefined`. The oldValues contains the same key, but with the value before it was deleted.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   * console.log(state.get('some-key') === 'some-value') // true
   *
   * state.delete('some-key')
   * console.log(state.get('some-key') === undefined) // true
   * ```
   *
   * @param key the key
   */
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

  /**
   * Deletes the values of the given keys.
   *
   * Calls `stateChangedCallback` of all the registered elements. Saves the values to the storage provider.
   *
   * The newValues object passed to the callback contains the keys of the deleted values with the values set to `undefined`. The oldValues object contains the same keys, but with the values before they were deleted.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   * console.log(state.get('some-key') === 'some-value') // true
   *
   * state.deleteAll(['some-key'])
   * console.log(state.get('some-key') === undefined) // true
   * ```
   *
   * @param keys the keys
   */
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

    return this.save()
  }

  /**
   * Gets the value of a key.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   * console.log(state.get('some-key') === 'some-value') // true
   * ```
   *
   * @param key the key
   */
  public get<Key extends keyof StateValues & string>(key: Key): StateValues[Key] | undefined {
    return this.values.get(key) as StateValues[Key]
  }

  /**
   * Gets all the values.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   *
   * const value = state.getAll()
   *
   * console.log(values['some-key'] === 'some-value') // true
   * ```
   */
  public getAll(): Partial<StateValues> {
    return Object.fromEntries(this.values.entries()) as Partial<StateValues>
  }

  /**
   * Checks whether the state holds a value with the given key.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   * console.log(state.has('some-key')) // true
   * ```
   *
   * @param key the key
   */
  public has<Key extends keyof StateValues & string>(key: Key): boolean {
    return this.values.has(key)
  }

  /**
   * Loads the values from the storage provider.
   *
   * If the storage provider is set to `idb`, `loaded` will be resolved after the values have been loaded.
   */
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

  /**
   * Registers an element to be notified when the state has changed.
   *
   * @param element the element
   */
  public register(element: StatefulElement<StateValues>): void {
    this.elements.add(element)
  }

  /**
   * Saves the values to the storage provider.
   */
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

  /**
   * Set the value for the given key.
   *
   * Calls `stateChangedCallback` of all the registered elements. Saves the values to the storage provider.
   *
   * The newValues object passed to the callback contains the key and the new value. The oldValues object contains the same key, but with the value before it was set.
   *
   * If the key already exists and has the same value as the new value nothing is done.
   *
   * @example
   * ```javascript
   * state.set('some-key', 'some-value')
   * console.log(state.get('some-key') === 'some-value') // true
   * ```
   *
   *
   * @param key the key
   * @param value the value
   */
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

    return this.save()
  }

  /**
   * Set the value for the given key.
   *
   * Calls `stateChangedCallback` of all the registered elements. Saves the values to the storage provider.
   *
   * The newValues object passed to the callback contains the keys and the new values. The oldValues object contains the same keys, but with the values before they were set.
   *
   * If a key already exists and has the same value as the new value it is not added to the newValues and oldValues object.
   *
   * @example
   * ```javascript
   * state.setAll({
   *   'some-key': 'some-value',
   * })
   *
   * console.log(state.get('some-key') === 'some-value') // true
   * ```
   *
   * @param values the values
   */
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

    return this.save()
  }

  /**
   * Set the value for the given key only if it is not yet set.
   *
   * ```javascript
   * state.setnx('some-key', 'some-value')
   *
   * console.log(state.get('some-key') === 'some-value') // true
   *
   * state.setnx('some-key', 'other-value')
   *
   * console.log(state.get('some-key') === 'some-value') // true
   * ```
   *
   * @param key the key
   * @param value the value
   */
  public setnx<Key extends keyof StateValues & string>(key: Key, value: StateValues[Key]): this {
    if (!this.has(key)) {
      this.set(key, value)
    }

    return this
  }

  /**
   * Unloads the state.
   *
   * Clears only the values of the state, not in the storage provider.
   */
  public unload(): void {
    this.loaded = undefined
    this.values.clear()
  }

  /**
   * Unregisters an element.
   *
   * @param element the element
   */
  public unregister(element: StatefulElement<StateValues>): void {
    this.elements.delete(element)
  }
}
