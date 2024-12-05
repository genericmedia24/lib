import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { DivElement, elements } from '../../src/elements/index.js'

describe('DivElement', () => {
  HTMLDivElement.prototype.hidePopover = (): void => {}
  HTMLDivElement.prototype.showPopover = (): void => {}
  defineElements(elements)

  it('should setup state', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()
    test.assert.equal(divElement.state?.name, 'test')
    test.assert.equal(divElement.state?.elements.has(divElement), true)
    divElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.connectedCallback()
    test.assert.equal(divElement.state?.name, 'test')
    test.assert.equal(divElement.state?.elements.has(divElement), true)
    divElement.disconnectedCallback()
    test.assert.equal(divElement.state?.elements.has(divElement), false)
  })

  it('should execute connected command', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    divElement.connectedCallback()
    test.assert.equal(divElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    divElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    divElement.disconnectedCallback()
    test.assert.equal(divElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute state', (test) => {
    const divElement = new DivElement()
    const commanderExecuteState = test.mock.method(divElement.commander, 'executeState')

    divElement.stateChangedCallback({
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

  it('should register escape callback on showPopover', (test) => {
    const divElement = new DivElement()

    divElement.showPopover()
    test.assert.equal(divElement.escapeBinding.callbacks.length, 1)
    divElement.hidePopover()
  })

  it('should unregister escape callback on hidePopover', (test) => {
    const divElement = new DivElement()

    divElement.showPopover()
    test.assert.equal(divElement.escapeBinding.callbacks.length, 1)
    divElement.hidePopover()
    test.assert.equal(divElement.escapeBinding.callbacks.length, 0)
  })
})
