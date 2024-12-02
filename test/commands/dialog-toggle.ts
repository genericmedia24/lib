import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { DialogToggleCommand } from '../../src/commands/dialog-toggle.js'

describe('DialogToggleCommand', () => {
  HTMLDialogElement.prototype.show = function show(): void {
    this.open = true
  }

  HTMLDialogElement.prototype.showModal = function showModal(): void {
    this.open = true
  }

  HTMLDialogElement.prototype.close = function close(): void {
    this.open = false
    this.dispatchEvent(new window.Event('close'))
  }

  it('should show dialog', (test) => {
    document.body.innerHTML = '<dialog></dialog>'

    const dialogElement = document.querySelector('dialog')

    if (dialogElement !== null) {
      test.assert.equal(dialogElement.open, false)

      const command = new DialogToggleCommand(dialogElement, dialogElement)
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

      const command = new DialogToggleCommand(dialogElement, dialogElement, {
        modal: 'true',
      })

      command.execute()

      test.assert.equal(dialogElement.open, true)
      test.assert.equal(dialogElementOpenModal.mock.callCount(), 1)
    }
  })

  it('should close dialog', (test) => {
    document.body.innerHTML = '<dialog open></dialog>'

    const dialogElement = document.querySelector('dialog')

    if (dialogElement !== null) {
      test.assert.equal(dialogElement.open, true)

      const command = new DialogToggleCommand(dialogElement, dialogElement)
      command.execute()

      test.assert.equal(dialogElement.open, false)
    }
  })
})
