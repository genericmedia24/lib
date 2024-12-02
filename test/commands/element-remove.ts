import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ElementRemoveCommand } from '../../src/commands/element-remove.js'

describe('ElementRemoveCommand', () => {
  it('should remove element', (test) => {
    document.body.innerHTML = '<div></div>'

    const divElement = document.querySelector('div')

    if (divElement !== null) {
      test.assert.equal(divElement.parentElement, document.body)

      const command = new ElementRemoveCommand(divElement, divElement)
      command.execute()

      test.assert.equal(divElement.parentElement, null)
    }
  })
})
