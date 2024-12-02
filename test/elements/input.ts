import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { elements, InputElement } from '../../src/elements/index.js'

describe('InputElement', () => {
  defineElements(elements)

  it('should setup state', (test) => {
    const inputElement = new InputElement()
    inputElement.dataset.state = 'test'
    inputElement.connectedCallback()

    test.assert.equal(inputElement.state?.name, 'test')
    test.assert.equal(inputElement.state?.elements.has(inputElement), true)

    inputElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const inputElement = new InputElement()
    inputElement.dataset.state = 'test'

    inputElement.connectedCallback()
    test.assert.equal(inputElement.state?.name, 'test')
    test.assert.equal(inputElement.state?.elements.has(inputElement), true)

    inputElement.disconnectedCallback()
    test.assert.equal(inputElement.state?.elements.has(inputElement), false)
  })

  it('should execute connected command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')

    inputElement.connectedCallback()

    test.assert.equal(inputElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')

    inputElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')

    inputElement.disconnectedCallback()

    test.assert.equal(inputElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute blur command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')
    const event = new window.FocusEvent('blur')

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'blur')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute focus command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')
    const event = new window.FocusEvent('focus')

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'focus')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute input command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')
    const event = new window.Event('input')

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'input')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      key: 'Enter',
    })

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'enter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command with ctrl key', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'Enter',
    })

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'ctrlenter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command with meta key', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
    })

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'ctrlenter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute paste command', (test) => {
    const inputElement = new InputElement()
    const commanderExecute = test.mock.method(inputElement.commander, 'execute')
    const event = new window.Event('paste')

    inputElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'paste')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute state', (test) => {
    const inputElement = new InputElement()
    const commanderExecuteState = test.mock.method(inputElement.commander, 'executeState')

    inputElement.stateChangedCallback({
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
