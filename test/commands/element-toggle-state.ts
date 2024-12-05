import 'fake-indexeddb/auto'
import 'global-jsdom/register'
import * as idb from 'idb-keyval'
import { afterEach, describe, it } from 'node:test'
import { ElementToggleStateCommand } from '../../src/commands/element-toggle-state.js'
import { defineElements } from '../../src/elements/define.js'
import { DivElement, elements } from '../../src/elements/index.js'
import { State } from '../../src/state/state.js'

describe('ElementToggleStateCommand', () => {
  defineElements(elements)

  afterEach(() => {
    State.instances.forEach((state) => {
      state.clear()
    })

    State.instances.clear()
  })

  it('should set state', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleStateCommand(divElement, divElement, {
      'state-key': 'key',
      'state-off': 'value-off',
      'state-on': 'value-on',
    })

    command.execute()
    test.assert.equal(divElement.state?.get('key'), 'value-on')
    command.execute()
    test.assert.equal(divElement.state?.get('key'), 'value-off')
    divElement.disconnectedCallback()
  })

  it('should set multiple states', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleStateCommand(divElement, divElement, {
      'state-key': [
        'key-1',
        'key-2',
      ],
      'state-off': [
        'value-off-1',
        'value-off-2',
      ],
      'state-on': [
        'value-on-1',
        'value-on-2',
      ],
    })

    command.execute()
    test.assert.equal(divElement.state?.get('key-1'), 'value-on-1')
    test.assert.equal(divElement.state?.get('key-2'), 'value-on-2')
    command.execute()
    test.assert.equal(divElement.state?.get('key-1'), 'value-off-1')
    test.assert.equal(divElement.state?.get('key-2'), 'value-off-2')
    divElement.disconnectedCallback()
  })

  it('should delete state', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleStateCommand(divElement, divElement, {
      'state-key': 'key',
      'state-off': '',
      'state-on': 'value-on',
    })

    command.execute()
    test.assert.equal(divElement.state?.get('key'), 'value-on')
    command.execute()
    test.assert.equal(divElement.state?.has('key'), false)
    divElement.disconnectedCallback()
  })

  it('should delete multiple states', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleStateCommand(divElement, divElement, {
      'state-key': [
        'key-1',
        'key-2',
      ],
      'state-off': [
        '',
        'value-off-2',
      ],
      'state-on': [
        'value-on-1',
        'value-on-2',
      ],
    })

    command.execute()
    test.assert.equal(divElement.state?.get('key-1'), 'value-on-1')
    test.assert.equal(divElement.state?.get('key-2'), 'value-on-2')
    command.execute()
    test.assert.equal(divElement.state?.has('key-1'), false)
    test.assert.equal(divElement.state?.get('key-2'), 'value-off-2')
    divElement.disconnectedCallback()
  })

  it('should wait for state to be loaded', async (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.dataset.stateStorage = 'idb'
    await idb.set('state-test', '[["key","value-on"]]')
    divElement.connectedCallback()
    await divElement.state?.loaded
    test.assert.equal(divElement.state?.get('key'), 'value-on')

    const command = new ElementToggleStateCommand(divElement, divElement, {
      'state-key': 'key',
      'state-off': 'value-off',
      'state-on': 'value-on',
    })

    await command.execute()
    test.assert.equal(divElement.state?.get('key'), 'value-off')
    divElement.disconnectedCallback()
  })
})
