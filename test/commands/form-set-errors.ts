import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { FormSetErrorsCommand } from '../../src/commands/form-set-errors.js'
import { CustomError } from '../../src/util/custom-error.js'

describe('FormSetErrorsCommand', () => {
  it('should set error', (test) => {
    document.body.innerHTML = `
      <form>
        <label for="input">
          <span data-error></span>
        </label>
        <input id="input" required>
      </form>
    `

    const formElement = document.querySelector('form')
    const labelElement = document.querySelector('label')

    if (
      formElement !== null &&
      labelElement !== null
    ) {
      const command = new FormSetErrorsCommand(formElement, formElement)

      command.execute({
        error: new CustomError('error', {
          data: {
            input: 'invalid input',
          },
        }),
      })

      test.assert.equal(labelElement.firstElementChild?.textContent, 'invalid input')
    }
  })
})
