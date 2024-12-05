import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { elements, FormElement } from '../../src/elements/index.js'

describe('FormElement', () => {
  defineElements(elements)

  it('should setup state', (test) => {
    const formElement = new FormElement()

    formElement.dataset.state = 'test'
    formElement.connectedCallback()
    test.assert.equal(formElement.state?.name, 'test')
    test.assert.equal(formElement.state?.elements.has(formElement), true)
    formElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const formElement = new FormElement()

    formElement.dataset.state = 'test'
    formElement.connectedCallback()
    test.assert.equal(formElement.state?.name, 'test')
    test.assert.equal(formElement.state?.elements.has(formElement), true)
    formElement.disconnectedCallback()
    test.assert.equal(formElement.state?.elements.has(formElement), false)
  })

  it('should execute connected command', (test) => {
    const formElement = new FormElement()
    const commanderExecute = test.mock.method(formElement.commander, 'execute')

    formElement.connectedCallback()
    test.assert.equal(formElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    formElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const formElement = new FormElement()
    const commanderExecute = test.mock.method(formElement.commander, 'execute')

    formElement.disconnectedCallback()
    test.assert.equal(formElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute submit command', (test) => {
    const formElement = new FormElement()
    const commanderExecute = test.mock.method(formElement.commander, 'execute')
    const event = new window.SubmitEvent('submit')

    formElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'submit')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute state', (test) => {
    const formElement = new FormElement()
    const commanderExecuteState = test.mock.method(formElement.commander, 'executeState')

    formElement.stateChangedCallback({
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
