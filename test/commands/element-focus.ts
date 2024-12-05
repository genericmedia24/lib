import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ElementFocusCommand } from '../../src/commands/element-focus.js'

describe('ElementFocusCommand', () => {
  it('should focus element', (test) => {
    document.body.innerHTML = '<input>'

    const inputElement = document.querySelector('input')

    if (inputElement !== null) {
      test.assert.notEqual(document.activeElement, inputElement)

      const command = new ElementFocusCommand(inputElement, inputElement)

      command.execute()
      test.assert.equal(document.activeElement, inputElement)
    }
  })
})
