import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { Element } from '../../src/elements/element.js'
import { elements } from '../../src/elements/index.js'

describe('Element', () => {
  defineElements(elements)
  window.customElements.define('gm-element', Element)

  it('should setup state', (test) => {
    const element = new Element()

    element.dataset.state = 'test'
    element.connectedCallback()
    test.assert.equal(element.state?.name, 'test')
    test.assert.equal(element.state?.elements.has(element), true)
    element.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const element = new Element()

    element.dataset.state = 'test'
    element.connectedCallback()
    test.assert.equal(element.state?.name, 'test')
    test.assert.equal(element.state?.elements.has(element), true)
    element.disconnectedCallback()
    test.assert.equal(element.state?.elements.has(element), false)
  })

  it('should execute connected command', (test) => {
    const element = new Element()
    const commanderExecute = test.mock.method(element.commander, 'execute')

    element.connectedCallback()
    test.assert.equal(element.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    element.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const element = new Element()
    const commanderExecute = test.mock.method(element.commander, 'execute')

    element.disconnectedCallback()
    test.assert.equal(element.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute state', (test) => {
    const element = new Element()
    const commanderExecuteState = test.mock.method(element.commander, 'executeState')

    element.stateChangedCallback({
      key: 'value',
    }, {
      key: undefined,
    })

    test.assert.equal(commanderExecuteState.mock.callCount(), 1)

    test.assert.deepEqual(commanderExecuteState.mock.calls.at(0)?.arguments.at(0), {
      key: 'value',
    })

    test.assert.deepEqual(commanderExecuteState.mock.calls.at(0)?.arguments.at(1), {
      key: undefined,
    })
  })
})
