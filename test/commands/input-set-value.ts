import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { InputSetValueCommand } from '../../src/commands/input-set-value.js'
import { defineElements } from '../../src/elements/define.js'
import { elements, type InputElement } from '../../src/elements/index.js'

describe('InputSetStateCommand', () => {
  defineElements(elements)

  it('should set value from input', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetValueCommand(inputElement, inputElement)

      command.execute({
        value: 'input-value',
      })

      test.assert.equal(inputElement.value, 'input-value')
    }
  })

  it('should set value from options', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetValueCommand(inputElement, inputElement, {
        value: 'input-value',
      })

      command.execute()
      test.assert.equal(inputElement.value, 'input-value')
    }
  })

  it('should set value from state', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      inputElement.state?.set('input-key', 'input-value')

      const command = new InputSetValueCommand(inputElement, inputElement, {
        'state-key': 'input-key',
      })

      command.execute()
      test.assert.equal(inputElement.value, 'input-value')
    }
  })
})
