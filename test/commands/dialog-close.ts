import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { DialogCloseCommand } from '../../src/commands/dialog-close.js'

describe('DialogCloseCommand', () => {
  HTMLDialogElement.prototype.close = function close(): void {
    this.open = false
    this.dispatchEvent(new window.Event('close'))
  }

  it('should close dialog', (test) => {
    document.body.innerHTML = '<dialog open></dialog>'

    const dialogElement = document.querySelector('dialog')

    if (dialogElement !== null) {
      test.assert.equal(dialogElement.open, true)

      const command = new DialogCloseCommand(dialogElement, dialogElement)

      command.execute()
      test.assert.equal(dialogElement.open, false)
    }
  })
})
