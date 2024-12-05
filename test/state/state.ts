import 'fake-indexeddb/auto'
import 'global-jsdom/register'
import * as idb from 'idb-keyval'
import { beforeEach, describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { DivElement } from '../../src/elements/div.js'
import { elements } from '../../src/elements/index.js'
import { State } from '../../src/state/state.js'

describe('State', () => {
  defineElements(elements)

  beforeEach(() => {
    State.instances.forEach((state) => {
      state.clear()
    })

    State.instances.clear()
  })

  it('should create singleton', (test) => {
    const state1 = State.create({
      name: 'test',
    })

    const state2 = State.create({
      name: 'test',
    })

    test.assert.equal(state1, state2)
  })

  it('should instantiate with default options', (test) => {
    const state = new State({
      name: 'test',
    })

    test.assert.equal(state.name, 'test')
    test.assert.equal(state.storage, 'local')
    test.assert.equal(state.values.size, 0)
  })

  it('should instantiate with initial values', (test) => {
    const state = new State({
      name: 'test',
      values: {
        key: 'value',
      },
    })

    test.assert.equal(state.get('key'), 'value')
  })

  it('should instantiate with default element attributes', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'

    const state = State.setup(divElement)

    test.assert.equal(state?.name, 'test')
    test.assert.equal(state?.storage, 'local')
    test.assert.equal(state?.values.size, 0)
  })

  it('should instantiate with custom element attributes', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.dataset.stateStorage = 'idb'
    divElement.dataset.stateValues = 'key=value'

    const state = State.setup(divElement)

    test.assert.equal(state?.name, 'test')
    test.assert.equal(state?.storage, 'idb')
    test.assert.equal(state?.get('key'), 'value')
  })

  it('should not instantiate without element attributes', (test) => {
    const divElement = new DivElement()
    const state = State.setup(divElement)

    test.assert.equal(state, undefined)
  })

  it('should load values from localStorage', (test) => {
    const state = new State({
      name: 'test',
    })

    window.localStorage.setItem(state.storageKey, '[["key","value"]]')
    state.load()
    test.assert.equal(state.get('key'), 'value')
  })

  it('should load values from localStorage with error', (test) => {
    const consoleError = test.mock.method(console, 'error', () => {})

    const state = new State({
      name: 'test',
    })

    window.localStorage.setItem(state.storageKey, 'malformed')
    state.load()
    test.assert.equal(state.has('key'), false)
    test.assert.equal(consoleError.mock.callCount(), 1)
  })

  it('should load values from IndexedDb', async (test) => {
    const state = new State({
      name: 'test',
      storage: 'idb',
    })

    await idb.set(state.storageKey, '[["key","value"]]')
    state.load()
    await state.loaded
    test.assert.equal(state.get('key'), 'value')
  })

  it('should load values from IndexedDb with error', async (test) => {
    const consoleError = test.mock.method(console, 'error', () => {})

    const state = new State({
      name: 'test',
      storage: 'idb',
    })

    await idb.set(state.storageKey, 'malformed')
    state.load()
    await state.loaded
    test.assert.equal(state.has('key'), false)
    test.assert.equal(consoleError.mock.callCount(), 1)
  })

  it('should load values and overwrite initial values', (test) => {
    const state = new State({
      name: 'test',
      values: {
        key: 'value',
      },
    })

    test.assert.equal(state.get('key'), 'value')
    window.localStorage.setItem(state.storageKey, '[]')
    state.load()
    test.assert.equal(state.has('key'), false)
  })

  it('should unload', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
    state.unload()
    test.assert.equal(state.loaded, undefined)
    test.assert.equal(state.has('key'), false)
    test.assert.notEqual(localStorage.getItem(state.storageKey), null)
  })

  it('should register element', (test) => {
    const state = new State({
      name: 'test',
    })

    const divElement = new DivElement()

    state.register(divElement)
    test.assert.equal(state.elements.size, 1)
  })

  it('should unregister element', (test) => {
    const state = new State({
      name: 'test',
    })

    const divElement = new DivElement()

    state.register(divElement)
    test.assert.equal(state.elements.size, 1)
    state.unregister(divElement)
    test.assert.equal(state.elements.size, 0)
  })

  it('should clear values from localStorage', (test) => {
    const state = new State({
      name: 'test',
      storage: 'local',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
    test.assert.equal(localStorage.getItem(state.storageKey), '[["key","value"]]')
    state.clear()
    test.assert.equal(state.has('key'), false)
    test.assert.equal(localStorage.getItem(state.storageKey), null)
  })

  it('should clear values from IndexedDb', async (test) => {
    const state = new State({
      name: 'test',
      storage: 'idb',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
    test.assert.equal(await idb.get(state.storageKey), '[["key","value"]]')
    state.clear()
    test.assert.equal(state.has('key'), false)
    test.assert.equal(await idb.get(state.storageKey), null)
  })

  it('should delete value', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')

    const result = state.delete('key')

    test.assert.equal(result, true)
    test.assert.equal(state.has('key'), false)
  })

  it('should delete value and skip non-existent key', (test) => {
    const state = new State({
      name: 'test',
    })

    const result = state.delete('key-1')

    test.assert.equal(result, false)
  })

  it('should delete all values', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key-1', 'value-1')
    state.set('key-2', 'value-2')
    test.assert.equal(state.get('key-1'), 'value-1')
    test.assert.equal(state.get('key-2'), 'value-2')
    state.deleteAll()
    test.assert.equal(state.has('key-1'), false)
    test.assert.equal(state.has('key-2'), false)
  })

  it('should delete multiple values', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key-1', 'value-1')
    state.set('key-2', 'value-2')
    test.assert.equal(state.get('key-1'), 'value-1')
    test.assert.equal(state.get('key-2'), 'value-2')
    state.deleteAll(['key-1'])
    test.assert.equal(state.has('key-1'), false)
    test.assert.equal(state.get('key-2'), 'value-2')
  })

  it('should delete multiple values and skip non-existent keys', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key-1', 'value-1')
    state.set('key-2', 'value-2')
    test.assert.equal(state.get('key-1'), 'value-1')
    test.assert.equal(state.get('key-2'), 'value-2')
    state.deleteAll(['key-1', 'key-3'])
    test.assert.equal(state.has('key-1'), false)
    test.assert.equal(state.get('key-2'), 'value-2')
  })

  it('should get value', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
  })

  it('should get all values', (test) => {
    const state = new State({
      name: 'test',
    })

    const values = {
      'key-1': 'value-1',
      'key-2': 'value-2',
    }

    state.setAll(values)
    test.assert.notEqual(state.getAll(), values)
    test.assert.deepEqual(state.getAll(), values)
  })

  it('should set value', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
  })

  it('should set value and skip equals values', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')
  })

  it('should setnx value only once', (test) => {
    const state = new State({
      name: 'test',
    })

    state.setnx('key', 'value')
    test.assert.equal(state.get('key'), 'value')
    state.setnx('key', 'value-2')
    test.assert.equal(state.get('key'), 'value')
  })

  it('should set all values', (test) => {
    const state = new State({
      name: 'test',
    })

    state.setAll({
      'key-1': 'value-1',
      'key-2': 'value-2',
    })

    test.assert.equal(state.get('key-1'), 'value-1')
    test.assert.equal(state.get('key-2'), 'value-2')
  })

  it('should set all values and skip equal values', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')
    test.assert.equal(state.get('key'), 'value')

    state.setAll({
      key: 'value',
    })

    test.assert.equal(state.get('key'), 'value')
  })

  it('should call stateChangedCallback when deleting value', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key', 'value')

    const divElement = new DivElement()

    const callback = test.mock.method(divElement, 'stateChangedCallback', (newValues: unknown, oldValues: undefined) => {
      test.assert.deepEqual(newValues, {
        key: undefined,
      })

      test.assert.deepEqual(oldValues, {
        key: 'value',
      })
    })

    state.register(divElement)
    state.delete('key')
    test.assert.equal(callback.mock.callCount(), 1)
  })

  it('should call stateChangedCallback when deleting all values', (test) => {
    const state = new State({
      name: 'test',
    })

    state.set('key-1', 'value-1')
    state.set('key-2', 'value-2')

    const divElement = new DivElement()

    const callback = test.mock.method(divElement, 'stateChangedCallback', (newValues: unknown, oldValues: undefined) => {
      test.assert.deepEqual(newValues, {
        'key-1': undefined,
        'key-2': undefined,
      })

      test.assert.deepEqual(oldValues, {
        'key-1': 'value-1',
        'key-2': 'value-2',
      })
    })

    state.register(divElement)
    state.deleteAll()
    test.assert.equal(callback.mock.callCount(), 1)
  })

  it('should call stateChangedCallback when setting value', (test) => {
    const state = new State({
      name: 'test',
    })

    const divElement = new DivElement()

    const callback = test.mock.method(divElement, 'stateChangedCallback', (newValues: unknown, oldValues: undefined) => {
      test.assert.deepEqual(newValues, {
        key: 'value',
      })

      test.assert.deepEqual(oldValues, {
        key: undefined,
      })
    })

    state.register(divElement)
    state.set('key', 'value')
    test.assert.equal(callback.mock.callCount(), 1)
  })

  it('should call stateChangedCallback when setting all values', (test) => {
    const state = new State({
      name: 'test',
    })

    const divElement = new DivElement()

    const callback = test.mock.method(divElement, 'stateChangedCallback', (newValues: unknown, oldValues: undefined) => {
      test.assert.deepEqual(newValues, {
        'key-1': 'value-1',
        'key-2': 'value-2',
      })

      test.assert.deepEqual(oldValues, {
        'key-1': undefined,
        'key-2': undefined,
      })
    })

    state.register(divElement)

    state.setAll({
      'key-1': 'value-1',
      'key-2': 'value-2',
    })

    test.assert.equal(callback.mock.callCount(), 1)
  })
})
