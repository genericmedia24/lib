import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { DialogShowCommand } from '../../src/commands/dialog-show.js'

describe('DialogShowCommand', () => {
  HTMLDialogElement.prototype.show = function show(): void {
    this.open = true
  }

  HTMLDialogElement.prototype.showModal = function showModal(): void {
    this.open = true
  }

  it('should show dialog', (test) => {
    document.body.innerHTML = '<dialog></dialog>'

    const dialogElement = document.querySelector('dialog')

    if (dialogElement !== null) {
      test.assert.equal(dialogElement.open, false)

      const command = new DialogShowCommand(dialogElement, dialogElement)

      command.execute()
      test.assert.equal(dialogElement.open, true)
    }
  })

  it('should show dialog as modal', (test) => {
    document.body.innerHTML = '<dialog></dialog>'

    const dialogElement = document.querySelector('dialog')

    if (dialogElement !== null) {
      // jsdom does not support modals, so a mock is needed
      const dialogElementOpenModal = test.mock.method(dialogElement, 'showModal')

      test.assert.equal(dialogElement.open, false)

      const command = new DialogShowCommand(dialogElement, dialogElement, {
        modal: 'true',
      })

      command.execute()
      test.assert.equal(dialogElement.open, true)
      test.assert.equal(dialogElementOpenModal.mock.callCount(), 1)
    }
  })
})
