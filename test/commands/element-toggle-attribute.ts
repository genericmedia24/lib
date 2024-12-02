import 'fake-indexeddb/auto'
import 'global-jsdom/register'
import * as idb from 'idb-keyval'
import { afterEach, describe, it } from 'node:test'
import { ElementToggleAttributeCommand } from '../../src/commands/element-toggle-attribute.js'
import { defineElements } from '../../src/elements/define.js'
import { DivElement } from '../../src/elements/div.js'
import { elements } from '../../src/elements/index.js'
import { State } from '../../src/state/state.js'

describe('ElementToggleAttributeCommand', () => {
  defineElements(elements)

  afterEach(() => {
    State.instances.forEach((state) => {
      state.clear()
    })

    State.instances.clear()
  })

  it('should toggle attribute with matching state', (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleAttributeCommand(divElement, divElement, {
      'attribute-name': 'hidden',
      'state-key': 'count',
      'state-value': '!undefined',
    })

    test.assert.equal(divElement.hasAttribute('hidden'), false)

    divElement.state?.set('count', '0')
    command.execute()

    test.assert.equal(divElement.hasAttribute('hidden'), true)
  })

  it('should toggle attribute with multiple matching states', (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleAttributeCommand(divElement, divElement, {
      'attribute-name': 'hidden',
      'state-key': [
        'count',
        'avg',
      ],
      'state-value': [
        '!undefined',
        '!undefined',
      ],
    })

    test.assert.equal(divElement.hasAttribute('hidden'), false)

    divElement.state?.set('count', '0')
    divElement.state?.set('avg', '0')
    command.execute()

    test.assert.equal(divElement.hasAttribute('hidden'), true)
  })

  it('should not toggle attribute with one or more non-matching states', (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleAttributeCommand(divElement, divElement, {
      'attribute-name': 'hidden',
      'state-key': [
        'count',
        'avg',
      ],
      'state-value': [
        '0',
        '1',
      ],
    })

    test.assert.equal(divElement.hasAttribute('hidden'), false)

    divElement.state?.set('count', '0')
    divElement.state?.set('avg', '0')
    command.execute()

    test.assert.equal(divElement.hasAttribute('hidden'), false)
  })

  it('should not toggle attribute with one or more undefined states', (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleAttributeCommand(divElement, divElement, {
      'attribute-name': 'hidden',
      'state-key': [
        'count',
        'avg',
      ],
      'state-value': [
        '0',
      ],
    })

    test.assert.equal(divElement.hasAttribute('hidden'), false)

    divElement.state?.set('count', '0')
    divElement.state?.set('avg', '0')
    command.execute()

    test.assert.equal(divElement.hasAttribute('hidden'), false)
  })

  it('should toggle multiple attributes', (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'
    divElement.connectedCallback()

    const command = new ElementToggleAttributeCommand(divElement, divElement, {
      'attribute-name': [
        'aria-hidden',
        'hidden',
      ],
      'state-key': 'count',
      'state-value': 'undefined',
    })

    test.assert.equal(divElement.hasAttribute('aria-hidden'), false)
    test.assert.equal(divElement.hasAttribute('hidden'), false)

    command.execute()

    test.assert.equal(divElement.hasAttribute('aria-hidden'), true)
    test.assert.equal(divElement.hasAttribute('hidden'), true)
  })

  it('should wait for state to be loaded', async (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'
    divElement.dataset.stateStorage = 'idb'

    await idb.set('state-test', '[["count",0]]')
    divElement.connectedCallback()

    await divElement.state?.loaded
    test.assert.equal(divElement.state?.get('count'), 0)

    const command = new ElementToggleAttributeCommand(divElement, divElement, {
      'attribute-name': 'hidden',
      'state-key': 'count',
      'state-value': '!undefined',
    })

    test.assert.equal(divElement.hasAttribute('hidden'), false)

    await command.execute()

    test.assert.equal(divElement.hasAttribute('hidden'), true)
  })
})
