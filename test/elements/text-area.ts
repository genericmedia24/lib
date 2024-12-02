import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { elements, TextAreaElement } from '../../src/elements/index.js'

describe('TextAreaElement', () => {
  defineElements(elements)

  it('should setup state', (test) => {
    const textAreaElement = new TextAreaElement()
    textAreaElement.dataset.state = 'test'
    textAreaElement.connectedCallback()

    test.assert.equal(textAreaElement.state?.name, 'test')
    test.assert.equal(textAreaElement.state?.elements.has(textAreaElement), true)

    textAreaElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const textAreaElement = new TextAreaElement()
    textAreaElement.dataset.state = 'test'

    textAreaElement.connectedCallback()
    test.assert.equal(textAreaElement.state?.name, 'test')
    test.assert.equal(textAreaElement.state?.elements.has(textAreaElement), true)

    textAreaElement.disconnectedCallback()
    test.assert.equal(textAreaElement.state?.elements.has(textAreaElement), false)
  })

  it('should execute connected command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')

    textAreaElement.connectedCallback()

    test.assert.equal(textAreaElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')

    textAreaElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')

    textAreaElement.disconnectedCallback()

    test.assert.equal(textAreaElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute blur command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')
    const event = new window.FocusEvent('blur')

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'blur')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute focus command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')
    const event = new window.FocusEvent('focus')

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'focus')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute input command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')
    const event = new window.Event('input')

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'input')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      key: 'Enter',
    })

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'enter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command with ctrl key', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'Enter',
    })

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'ctrlenter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute enter command with meta key', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')

    const event = new window.KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
    })

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'ctrlenter')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute paste command', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecute = test.mock.method(textAreaElement.commander, 'execute')
    const event = new window.Event('paste')

    textAreaElement.dispatchEvent(event)

    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'paste')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute state', (test) => {
    const textAreaElement = new TextAreaElement()
    const commanderExecuteState = test.mock.method(textAreaElement.commander, 'executeState')

    textAreaElement.stateChangedCallback({
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
