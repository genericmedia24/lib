import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { InputSetErrorCommand } from '../../src/commands/input-set-error.js'

describe('InputSetErrorCommand', () => {
  it('should set error', (test) => {
    document.body.innerHTML = `
      <label for="input">
        <span data-error></span>
      </label>
      <input id="input" required>
    `

    const inputElement = document.querySelector('input')
    const labelElement = document.querySelector('label')

    if (
      inputElement !== null &&
      labelElement !== null
    ) {
      const command = new InputSetErrorCommand(inputElement, inputElement)
      command.execute()

      test.assert.equal(labelElement.firstElementChild?.textContent, inputElement.validationMessage.toString())
    }
  })
})
