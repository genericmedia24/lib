import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ButtonSubmitCommand } from '../../src/commands/button-submit.js'

describe('ButtonSubmitCommand', () => {
  it('should submit form', async () => {
    document.body.innerHTML = '<form><button></button></form>'

    const buttonElement = document.querySelector('button')
    const formElement = document.querySelector('form')

    if (
      buttonElement !== null &&
      formElement !== null
    ) {
      const command = new ButtonSubmitCommand(buttonElement, buttonElement)

      await new Promise<void>((resolve) => {
        formElement.onsubmit = (event): void => {
          event.preventDefault()
          resolve()
        }

        command.execute()
      })
    }
  })
})
