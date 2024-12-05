import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ButtonElement } from '../../src/elements/button.js'
import { defineElements } from '../../src/elements/define.js'
import { elements } from '../../src/elements/index.js'

describe('ButtonElement', () => {
  defineElements(elements)

  it('should setup state', (test) => {
    const buttonElement = new ButtonElement()

    buttonElement.dataset.state = 'test'
    buttonElement.connectedCallback()
    test.assert.equal(buttonElement.state?.name, 'test')
    test.assert.equal(buttonElement.state?.elements.has(buttonElement), true)
    buttonElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const buttonElement = new ButtonElement()

    buttonElement.dataset.state = 'test'
    buttonElement.connectedCallback()
    test.assert.equal(buttonElement.state?.name, 'test')
    test.assert.equal(buttonElement.state?.elements.has(buttonElement), true)
    buttonElement.disconnectedCallback()
    test.assert.equal(buttonElement.state?.elements.has(buttonElement), false)
  })

  it('should execute connected command', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecute = test.mock.method(buttonElement.commander, 'execute')

    buttonElement.connectedCallback()
    test.assert.equal(buttonElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    buttonElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecute = test.mock.method(buttonElement.commander, 'execute')

    buttonElement.disconnectedCallback()
    test.assert.equal(buttonElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute auxclick command', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecute = test.mock.method(buttonElement.commander, 'execute')
    const event = new window.MouseEvent('auxclick')

    buttonElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'auxclick')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute click command', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecute = test.mock.method(buttonElement.commander, 'execute')
    const event = new window.MouseEvent('click')

    buttonElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'click')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute contextmenu command', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecute = test.mock.method(buttonElement.commander, 'execute')
    const event = new window.MouseEvent('contextmenu')

    buttonElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'contextmenu')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute dblclick command', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecute = test.mock.method(buttonElement.commander, 'execute')
    const event = new window.MouseEvent('dblclick')

    buttonElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'dblclick')

    test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
      event,
    })
  })

  it('should execute state', (test) => {
    const buttonElement = new ButtonElement()
    const commanderExecuteState = test.mock.method(buttonElement.commander, 'executeState')

    buttonElement.stateChangedCallback({
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
