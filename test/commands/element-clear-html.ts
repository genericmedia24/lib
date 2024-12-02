import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { ElementClearHtmlCommand } from '../../src/commands/element-clear-html.js'

describe('ElementClearHtmlCommand', () => {
  it('should clear innerHTML', (test) => {
    document.body.innerHTML = '<div>test</div>'

    const divElement = document.querySelector('div')

    if (divElement !== null) {
      test.assert.equal(divElement.innerHTML, 'test')

      const command = new ElementClearHtmlCommand(divElement, divElement)
      command.execute()

      test.assert.equal(divElement.innerHTML, '')
    }
  })
})
