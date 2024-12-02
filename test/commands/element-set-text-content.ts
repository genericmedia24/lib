import 'global-jsdom/register'
import { afterEach, describe, it } from 'node:test'
import { ElementSetTextContentCommand } from '../../src/commands/element-set-text-content.js'
import { defineElements } from '../../src/elements/define.js'
import { DivElement, elements } from '../../src/elements/index.js'
import { State } from '../../src/state/state.js'

describe('ElementSetTextContentCommand', () => {
  defineElements(elements)

  afterEach(() => {
    State.instances.forEach((state) => {
      state.clear()
    })

    State.instances.clear()
  })

  it('should set text content from data', (test) => {
    const divElement = new DivElement()
    const command = new ElementSetTextContentCommand(divElement, divElement)

    command.execute({
      'text-content': 'text-content',
    })

    test.assert.equal(divElement.textContent, 'text-content')
  })

  it('should set text content from options', (test) => {
    const divElement = new DivElement()

    const command = new ElementSetTextContentCommand(divElement, divElement, {
      'text-content': 'text-content',
    })

    command.execute()

    test.assert.equal(divElement.textContent, 'text-content')
  })

  it('should set text content from state', (test) => {
    const divElement = new DivElement()
    divElement.dataset.state = 'test'

    divElement.connectedCallback()
    divElement.state?.set('text-key', 'text-content')

    const command = new ElementSetTextContentCommand(divElement, divElement, {
      'state-key': 'text-key',
    })

    command.execute()

    test.assert.equal(divElement.textContent, 'text-content')
  })
})
