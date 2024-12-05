import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { DialogElement, elements, OutputElement } from '../../src/elements/index.js'

describe('DialogElement', () => {
  HTMLDialogElement.prototype.close = function close(): void {
    this.open = false
    this.dispatchEvent(new window.Event('close'))
  }

  HTMLDialogElement.prototype.show = function show(): void {
    this.open = true
  }

  HTMLDialogElement.prototype.showModal = function showModal(): void {
    this.open = true
  }

  HTMLOutputElement.prototype.hidePopover = (): void => {}
  HTMLOutputElement.prototype.showPopover = (): void => {}
  defineElements(elements)

  it('should setup state', (test) => {
    const dialogElement = new DialogElement()

    dialogElement.dataset.state = 'test'
    dialogElement.connectedCallback()
    test.assert.equal(dialogElement.state?.name, 'test')
    test.assert.equal(dialogElement.state?.elements.has(dialogElement), true)
    dialogElement.disconnectedCallback()
  })

  it('should teardown state', (test) => {
    const dialogElement = new DialogElement()

    dialogElement.dataset.state = 'test'
    dialogElement.connectedCallback()
    test.assert.equal(dialogElement.state?.name, 'test')
    test.assert.equal(dialogElement.state?.elements.has(dialogElement), true)
    dialogElement.disconnectedCallback()
    test.assert.equal(dialogElement.state?.elements.has(dialogElement), false)
  })

  it('should execute connected command', (test) => {
    const dialogElement = new DialogElement()
    const commanderExecute = test.mock.method(dialogElement.commander, 'execute')

    dialogElement.connectedCallback()
    test.assert.equal(dialogElement.commander.started, true)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'connected')
    dialogElement.disconnectedCallback()
  })

  it('should execute disconnected command', (test) => {
    const dialogElement = new DialogElement()
    const commanderExecute = test.mock.method(dialogElement.commander, 'execute')

    dialogElement.disconnectedCallback()
    test.assert.equal(dialogElement.commander.started, false)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'disconnected')
  })

  it('should execute state', (test) => {
    const dialogElement = new DialogElement()
    const commanderExecuteState = test.mock.method(dialogElement.commander, 'executeState')

    dialogElement.stateChangedCallback({
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

  it('should prevent cancel event', (test) => {
    const dialogElement = new DialogElement()

    const event = new window.Event('cancel', {
      cancelable: true,
    })

    dialogElement.dispatchEvent(event)
    test.assert.equal(event.defaultPrevented, true)
  })

  it('should update z-index on show', (test) => {
    const dialogElement1 = document.body.appendChild(new DialogElement())

    dialogElement1.show()

    const dialogElement2 = document.body.appendChild(new DialogElement())

    dialogElement2.show()
    test.assert.equal(dialogElement2.style.getPropertyValue('z-index'), '5')
    dialogElement1.remove()
    dialogElement2.remove()
  })

  it('should reset outputs on show', (test) => {
    const outputElement = document.body.appendChild(new OutputElement())

    test.assert.equal(outputElement.parentElement, document.body)

    const dialogElement = document.body.appendChild(new DialogElement())

    dialogElement.show()
    test.assert.equal(outputElement.parentElement, dialogElement)
    dialogElement.remove()
    outputElement.remove()
  })

  it('should register escape callback on show', (test) => {
    const dialogElement = new DialogElement()

    dialogElement.show()
    test.assert.equal(dialogElement.escapeBinding.callbacks.length, 1)
    dialogElement.close()
  })

  it('should execute show command on show', (test) => {
    const dialogElement = new DialogElement()
    const commanderExecute = test.mock.method(dialogElement.commander, 'execute')

    dialogElement.show()
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'show')
    dialogElement.close()
  })

  it('should reset outputs on showModal', (test) => {
    const outputElement = document.body.appendChild(new OutputElement())

    test.assert.equal(outputElement.parentElement, document.body)

    const dialogElement = document.body.appendChild(new DialogElement())

    dialogElement.showModal()
    test.assert.equal(outputElement.parentElement, dialogElement)
    dialogElement.remove()
    outputElement.remove()
  })

  it('should register escape callback on showModal', (test) => {
    const dialogElement = new DialogElement()

    dialogElement.showModal()
    test.assert.equal(dialogElement.escapeBinding.callbacks.length, 1)
    dialogElement.close()
  })

  it('should execute show command on showModal', (test) => {
    const dialogElement = new DialogElement()
    const commanderExecute = test.mock.method(dialogElement.commander, 'execute')

    dialogElement.showModal()
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'show')
    dialogElement.close()
  })

  it('should update z-index on close', (test) => {
    const dialogElement = new DialogElement()

    dialogElement.show()
    test.assert.equal(dialogElement.style.getPropertyValue('z-index'), '4')
    dialogElement.close()
    test.assert.equal(dialogElement.style.getPropertyValue('z-index'), '')
  })

  it('should reset outputs on close', (test) => {
    const outputElement = document.body.appendChild(new OutputElement())

    test.assert.equal(outputElement.parentElement, document.body)

    const dialogElement = document.body.appendChild(new DialogElement())

    dialogElement.show()
    test.assert.equal(outputElement.parentElement, dialogElement)
    dialogElement.close()
    test.assert.equal(outputElement.parentElement, document.body)
    dialogElement.remove()
    outputElement.remove()
  })

  it('should unregister escape callback on close', (test) => {
    const dialogElement = new DialogElement()

    dialogElement.show()
    test.assert.equal(dialogElement.escapeBinding.callbacks.length, 1)
    dialogElement.close()
    test.assert.equal(dialogElement.escapeBinding.callbacks.length, 0)
  })

  it('should reregister escape callback on focus', (test) => {
    const dialogElement = new DialogElement()
    const event = new window.FocusEvent('focus')
    const keyBindingRegister = test.mock.method(dialogElement.escapeBinding, 'register')
    const keyBindingUnregister = test.mock.method(dialogElement.escapeBinding, 'unregister')

    dialogElement.dispatchEvent(event)
    test.assert.equal(keyBindingRegister.mock.callCount(), 1)
    test.assert.equal(keyBindingUnregister.mock.callCount(), 1)
  })

  it('should update z-index on focus', (test) => {
    const dialogElement1 = document.body.appendChild(new DialogElement())

    dialogElement1.show()
    test.assert.equal(dialogElement1.style.getPropertyValue('z-index'), '4')

    const dialogElement2 = document.body.appendChild(new DialogElement())

    dialogElement2.show()
    test.assert.equal(dialogElement2.style.getPropertyValue('z-index'), '5')

    const event = new window.FocusEvent('focus')

    dialogElement1.dispatchEvent(event)
    test.assert.equal(dialogElement1.style.getPropertyValue('z-index'), '6')
    dialogElement1.remove()
    dialogElement2.remove()
  })

  it('should execute close command on transitionend', (test) => {
    const dialogElement = new DialogElement()
    const commanderExecute = test.mock.method(dialogElement.commander, 'execute')
    const event = new window.Event('transitionend')

    // @ts-expect-error TransitionEvent is undefined
    event.propertyName = 'display'
    dialogElement.dispatchEvent(event)
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'close')
  })
})
