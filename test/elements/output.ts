import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { elements, OutputElement } from '../../src/elements/index.js'

describe('OutputElement', () => {
  HTMLOutputElement.prototype.hidePopover = function hidePopover(): void {
    const event = new window.Event('toggle')

    // @ts-expect-error TransitionEvent is undefined
    event.newState = 'closed'
    this.dispatchEvent(event)
  }

  HTMLOutputElement.prototype.showPopover = function showPopover(): void {
    const event = new window.Event('toggle')

    // @ts-expect-error TransitionEvent is undefined
    event.newState = 'open'
    this.dispatchEvent(event)
  }

  defineElements(elements)

  it('should setup state', (test) => {
    const outputElement = new OutputElement()

    outputElement.dataset.state = 'test'
    outputElement.popover = 'manual'
    outputElement.connectedCallback()
    test.assert.equal(outputElement.state?.name, 'test')
    test.assert.equal(outputElement.state?.elements.has(outputElement), true)
    outputElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const outputElement = new OutputElement()

    outputElement.dataset.state = 'test'
    outputElement.popover = 'manual'
    outputElement.connectedCallback()
    test.assert.equal(outputElement.state?.name, 'test')
    test.assert.equal(outputElement.state?.elements.has(outputElement), true)
    outputElement.disconnectedCallback()
    test.assert.equal(outputElement.state?.elements.has(outputElement), false)
  })

  it('should execute connected command', (test) => {
    const outputElement = new OutputElement()
    const commanderExecute = test.mock.method(outputElement.commander, 'execute')

    outputElement.popover = 'manual'
    outputElement.connectedCallback()
    test.assert.equal(outputElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    outputElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const outputElement = new OutputElement()
    const commanderExecute = test.mock.method(outputElement.commander, 'execute')

    outputElement.disconnectedCallback()
    test.assert.equal(outputElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute state', (test) => {
    const outputElement = new OutputElement()
    const commanderExecuteState = test.mock.method(outputElement.commander, 'executeState')

    outputElement.stateChangedCallback({
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

  it('should hide popover after a timeout', async (test) => {
    const outputElement = new OutputElement()
    const outputElementHidePopover = test.mock.method(outputElement, 'hidePopover')

    outputElement.dataset.timeout = '100'
    outputElement.popover = 'manual'
    outputElement.connectedCallback()

    await new Promise((resolve) => {
      setTimeout(resolve, 200)
    })

    test.assert.equal(outputElementHidePopover.mock.callCount(), 1)
    outputElement.disconnectedCallback()
  })

  it('should register escape callback on showPopover', (test) => {
    const outputElement = new OutputElement()

    outputElement.popover = 'manual'
    outputElement.showPopover()
    test.assert.equal(outputElement.escapeBinding.callbacks.length, 1)
    outputElement.hidePopover()
  })

  it('should unregister escape callback on hidePopover', (test) => {
    const outputElement = new OutputElement()

    outputElement.popover = 'manual'
    outputElement.showPopover()
    test.assert.equal(outputElement.escapeBinding.callbacks.length, 1)
    outputElement.hidePopover()
    test.assert.equal(outputElement.escapeBinding.callbacks.length, 0)
  })

  it('should execute open command on toggle', (test) => {
    const outputElement = new OutputElement()
    const commanderExecute = test.mock.method(outputElement.commander, 'execute')

    outputElement.popover = 'manual'
    outputElement.showPopover()
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'open')
  })

  it('should execute closed command on toggle', (test) => {
    const outputElement = new OutputElement()
    const commanderExecute = test.mock.method(outputElement.commander, 'execute')

    outputElement.popover = 'manual'
    outputElement.style.setProperty('display', 'none')
    outputElement.hidePopover()
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'closed')
  })

  it('should execute closed command on transitionend', (test) => {
    const outputElement = new OutputElement()
    const commanderExecute = test.mock.method(outputElement.commander, 'execute')
    const event = new window.Event('transitionend')

    // @ts-expect-error TransitionEvent is undefined
    event.propertyName = 'display'
    outputElement.popover = 'manual'
    outputElement.style.setProperty('display', 'none')
    outputElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'closed')
  })

  it('should reset outputs', (test) => {
    const outputElement1 = new OutputElement()

    outputElement1.dataset.timeout = '100'
    outputElement1.popover = 'manual'
    outputElement1.style.setProperty('--output-bottom', '32px')
    outputElement1.style.setProperty('--output-gap', '8px')

    const outputElement2 = new OutputElement()

    outputElement2.dataset.timeout = '100'
    outputElement2.popover = 'manual'
    outputElement2.style.setProperty('--output-bottom', '32px')
    outputElement2.style.setProperty('--output-gap', '8px')

    const outputElement1StyleSetProperty = test.mock.method(outputElement1.style, 'setProperty')
    const outputElement2StyleSetProperty = test.mock.method(outputElement2.style, 'setProperty')

    document.body.appendChild(outputElement1)
    outputElement1.showPopover()
    document.body.appendChild(outputElement2)
    outputElement2.showPopover()
    outputElement1.hidePopover()
    test.assert.equal(outputElement1StyleSetProperty.mock.callCount(), 2)
    test.assert.equal(outputElement2StyleSetProperty.mock.callCount(), 2)

    test.assert.deepEqual(outputElement1StyleSetProperty.mock.calls.at(0)?.arguments, [
      'bottom',
      '40px',
    ])

    test.assert.deepEqual(outputElement1StyleSetProperty.mock.calls.at(1)?.arguments, [
      'bottom',
      '48px',
    ])

    test.assert.deepEqual(outputElement2StyleSetProperty.mock.calls.at(0)?.arguments, [
      'bottom',
      '40px',
    ])

    test.assert.deepEqual(outputElement2StyleSetProperty.mock.calls.at(1)?.arguments, [
      'bottom',
      '40px',
    ])

    outputElement1.remove()
    outputElement2.remove()
  })
})
