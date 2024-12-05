import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { elements, SelectElement } from '../../src/elements/index.js'

describe('SelectElement', () => {
  defineElements(elements)

  it('should setup state', (test) => {
    const selectElement = new SelectElement()

    selectElement.dataset.state = 'test'
    selectElement.connectedCallback()
    test.assert.equal(selectElement.state?.name, 'test')
    test.assert.equal(selectElement.state?.elements.has(selectElement), true)
    selectElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const selectElement = new SelectElement()

    selectElement.dataset.state = 'test'
    selectElement.connectedCallback()
    test.assert.equal(selectElement.state?.name, 'test')
    test.assert.equal(selectElement.state?.elements.has(selectElement), true)
    selectElement.disconnectedCallback()
    test.assert.equal(selectElement.state?.elements.has(selectElement), false)
  })

  it('should execute connected command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')

    selectElement.connectedCallback()
    test.assert.equal(selectElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    selectElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')

    selectElement.disconnectedCallback()
    test.assert.equal(selectElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute blur command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')
    const event = new window.FocusEvent('blur')

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'blur')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute change command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')
    const event = new window.Event('change')

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'change')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute focus command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')
    const event = new window.FocusEvent('focus')

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'focus')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute input command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')
    const event = new window.Event('input')

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'input')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      key: 'Enter',
    })

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'enter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command with ctrl key', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'Enter',
    })

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'ctrlenter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command with meta key', (test) => {
    const selectElement = new SelectElement()
    const commanderExecute = test.mock.method(selectElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
    })

    selectElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'ctrlenter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute state', (test) => {
    const selectElement = new SelectElement()
    const commanderExecuteState = test.mock.method(selectElement.commander, 'executeState')

    selectElement.stateChangedCallback({
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
