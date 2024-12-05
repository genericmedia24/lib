import 'fake-indexeddb/auto'
import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ElementToggleMarginCommand } from '../../src/commands/element-toggle-margin.js'
import { defineElements } from '../../src/elements/define.js'
import { DivElement } from '../../src/elements/div.js'
import { elements } from '../../src/elements/index.js'

describe('ElementToggleMarginCommand', () => {
  defineElements(elements)

  it('should hide element', async (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')
    const command = new ElementToggleMarginCommand(divElement, divElement)

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-line-start'), '0px')
    command.execute()

    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    test.assert.equal(divElement.style.getPropertyValue('margin-inline-start'), '-100px')
    divElement.dispatchEvent(new window.Event('transitionend'))
    test.assert.equal(divElement.style.getPropertyValue('display'), 'none')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should hide element immediately', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      immediate: 'true',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-inline-start'), '0px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), 'none')
    test.assert.equal(divElement.style.getPropertyValue('margin-inline-start'), '-100px')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should hide element from opposite position', async (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      position: 'end',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-line-end'), '0px')
    command.execute()

    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    test.assert.equal(divElement.style.getPropertyValue('margin-inline-end'), '-100px')
    divElement.dispatchEvent(new window.Event('transitionend'))
    test.assert.equal(divElement.style.getPropertyValue('display'), 'none')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should hide element from opposite position immediately', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      immediate: 'true',
      position: 'end',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-inline-end'), '0px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), 'none')
    test.assert.equal(divElement.style.getPropertyValue('margin-inline-end'), '-100px')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should not hide element when width === 0', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')
    const command = new ElementToggleMarginCommand(divElement, divElement)

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 0, 0)
    })

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-inline-end'), '0px')
    command.execute()
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-inline-end'), '-100px')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should show element', async (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')
    const command = new ElementToggleMarginCommand(divElement, divElement)

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('margin-inline-start', '-100px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')

    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    test.assert.equal(divElement.style.getPropertyValue('margin-inline-start'), '0px')
    divElement.dispatchEvent(new window.Event('transitionend'))
    test.assert.equal(divElement.style.getPropertyValue('margin-inline-start'), '')
  })

  it('should show element immediately', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      immediate: 'true',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('margin-inline-start', '-100px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.equal(divElement.style.getPropertyValue('margin-inline-start'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')
  })

  it('should show element from opposite position', async (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      position: 'end',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('margin-inline-end', '-100px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')

    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    test.assert.equal(divElement.style.getPropertyValue('margin-inline-end'), '0px')
    divElement.dispatchEvent(new window.Event('transitionend'))
    test.assert.equal(divElement.style.getPropertyValue('margin-inline-end'), '')
  })

  it('should show element from opposite position immediately', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      immediate: 'true',
      position: 'end',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 100, 100)
    })

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('margin-inline-end', '-100px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.equal(divElement.style.getPropertyValue('margin-inline-end'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')
  })

  it('should not show element when width === 0', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleMarginCommand(divElement, divElement, {
      immediate: 'true',
    })

    test.mock.method(divElement, 'getBoundingClientRect', () => {
      return new window.DOMRect(0, 0, 0, 0)
    })

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('margin-inline-start', '-100px')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.notEqual(divElement.style.getPropertyValue('margin-inline-start'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')
  })

  it('should wait for state to be loaded', async (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.dataset.stateStorage = 'idb'
    divElement.connectedCallback()

    const command = new ElementToggleMarginCommand(divElement, divElement)

    divElement.style.setProperty('display', 'none')
    command.execute()
    test.assert.notEqual(divElement.style.getPropertyValue('display'), '')
    await divElement.state?.loaded
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
  })
})
