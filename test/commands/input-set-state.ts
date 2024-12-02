import 'global-jsdom/register'
import { afterEach, describe, it } from 'node:test'
import { InputSetStateCommand } from '../../src/commands/input-set-state.js'
import { defineElements } from '../../src/elements/define.js'
import { elements, type InputElement } from '../../src/elements/index.js'
import { State } from '../../src/state/state.js'

describe('InputSetStateCommand', () => {
  defineElements(elements)

  afterEach(() => {
    State.instances.forEach((state) => {
      state.clear()
    })

    State.instances.clear()
  })

  it('should set state with key from input', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" value="input-value" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetStateCommand(inputElement, inputElement)

      command.execute()
      test.assert.equal(inputElement.state?.get('input-key'), 'input-value')
    }
  })

  it('should set state with key from options', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" value="input-value" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetStateCommand(inputElement, inputElement, {
        'state-key': 'option-key',
      })

      command.execute()
      test.assert.equal(inputElement.state?.get('option-key'), 'input-value')
    }
  })

  it('should not check validity of input', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" pattern="[a-z]+" type="text" value="input-value" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetStateCommand(inputElement, inputElement)

      command.execute()
      test.assert.equal(inputElement.state?.get('input-key'), 'input-value')
    }
  })

  it('should check validity of input when enabled', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" pattern="[a-z]+" type="text" value="input-value" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetStateCommand(inputElement, inputElement, {
        'check-validity': 'true',
      })

      command.execute()
      test.assert.equal(inputElement.state?.has('input-key'), false)
    }
  })

  it('should set multiple states with keys from options', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" value="input-value" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      const command = new InputSetStateCommand(inputElement, inputElement, {
        'state-key': [
          'input-key-1',
          'input-key-2',
        ],
      })

      command.execute()
      test.assert.equal(inputElement.state?.get('input-key-1'), 'input-value')
      test.assert.equal(inputElement.state?.get('input-key-2'), 'input-value')
    }
  })

  it('should delete state when value is empty string', (test) => {
    document.body.innerHTML = `
      <input id="input" name="input-key" type="text" value="" data-state="test" is="gm-input">
    `

    const inputElement = document.querySelector<InputElement>('input')

    if (inputElement) {
      inputElement.state?.set('input-key', 'input-value')
      test.assert.equal(inputElement.state?.get('input-key'), 'input-value')

      const command = new InputSetStateCommand(inputElement, inputElement)

      command.execute()
      test.assert.equal(inputElement.state?.has('input-key'), false)
    }
  })
})
