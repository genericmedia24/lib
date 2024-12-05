import 'fake-indexeddb/auto'
import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ElementToggleFlexCommand } from '../../src/commands/element-toggle-flex.js'
import { defineElements } from '../../src/elements/define.js'
import { DivElement } from '../../src/elements/div.js'
import { elements } from '../../src/elements/index.js'

describe('ElementToggleFlexCommand', () => {
  defineElements(elements)

  it('should hide element', async (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')
    const command = new ElementToggleFlexCommand(divElement, divElement)

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('flex-grow'), '0')
    command.execute()

    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    test.assert.equal(divElement.style.getPropertyValue('flex-grow'), '0')
    divElement.dispatchEvent(new window.Event('transitionend'))
    test.assert.equal(divElement.style.getPropertyValue('display'), 'none')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should hide element immediately', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleFlexCommand(divElement, divElement, {
      immediate: 'true',
    })

    divElement.toggleAttribute('hidden', true)
    test.assert.notEqual(divElement.style.getPropertyValue('display'), 'none')
    test.assert.notEqual(divElement.style.getPropertyValue('flex-grow'), '0')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), 'none')
    test.assert.equal(divElement.style.getPropertyValue('flex-grow'), '0')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'hidden')
  })

  it('should show element', async (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')
    const command = new ElementToggleFlexCommand(divElement, divElement)

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('flex', '0')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')

    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    test.assert.equal(divElement.style.getPropertyValue('flex'), '1')
    divElement.dispatchEvent(new window.Event('transitionend'))
    test.assert.equal(divElement.style.getPropertyValue('flex'), '')
  })

  it('should show element immediately', (test) => {
    const divElement = new DivElement()
    const commanderExecute = test.mock.method(divElement.commander, 'execute')

    const command = new ElementToggleFlexCommand(divElement, divElement, {
      immediate: 'true',
    })

    divElement.style.setProperty('display', 'none')
    divElement.style.setProperty('flex', '0')
    command.execute()
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
    test.assert.equal(divElement.style.getPropertyValue('flex'), '')
    test.assert.equal(commanderExecute.mock.callCount(), 1)
    test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'visible')
  })

  it('should wait for state to be loaded', async (test) => {
    const divElement = new DivElement()

    divElement.dataset.state = 'test'
    divElement.dataset.stateStorage = 'idb'
    divElement.connectedCallback()

    const command = new ElementToggleFlexCommand(divElement, divElement)

    divElement.style.setProperty('display', 'none')
    command.execute()
    test.assert.notEqual(divElement.style.getPropertyValue('display'), '')
    await divElement.state?.loaded
    test.assert.equal(divElement.style.getPropertyValue('display'), '')
  })
})
