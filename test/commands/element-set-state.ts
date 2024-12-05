import 'global-jsdom/register'
import { afterEach, describe, it } from 'node:test'
import { ElementSetStateCommand } from '../../src/commands/element-set-state.js'
import { defineElements } from '../../src/elements/define.js'
import { DivElement, elements } from '../../src/elements/index.js'
import { State } from '../../src/state/state.js'

describe('ElementSetStateCommand', () => {
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

    const command = new ElementSetStateCommand(divElement, divElement, {
      'state-key': 'key',
      'state-value': 'value',
    })

    command.execute()
    test.assert.equal(divElement.state?.get('key'), 'value')
    divElement.disconnectedCallback()
  })

  it('should set multiple states', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementSetStateCommand(divElement, divElement, {
      'state-key': [
        'key-1',
        'key-2',
      ],
      'state-value': [
        'value-1',
        'value-2',
      ],
    })

    command.execute()
    test.assert.equal(divElement.state?.get('key-1'), 'value-1')
    test.assert.equal(divElement.state?.get('key-2'), 'value-2')
    divElement.disconnectedCallback()
  })

  it('should delete state', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()
    divElement.state?.set('key', 'value')
    test.assert.equal(divElement.state?.get('key'), 'value')

    const command = new ElementSetStateCommand(divElement, divElement, {
      'state-key': 'key',
      'state-value': '',
    })

    command.execute()
    test.assert.equal(divElement.state?.has('key'), false)
    divElement.disconnectedCallback()
  })

  it('should delete multiple states', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()
    divElement.state?.set('key', 'value')
    test.assert.equal(divElement.state?.get('key'), 'value')

    const command = new ElementSetStateCommand(divElement, divElement, {
      'state-key': [
        'key-1',
        'key-2',
      ],
      'state-value': [
        '',
        'value-2',
      ],
    })

    command.execute()
    test.assert.equal(divElement.state?.has('key-1'), false)
    test.assert.equal(divElement.state?.get('key-2'), 'value-2')
    divElement.disconnectedCallback()
  })
})
