import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { PopoverShowCommand } from '../../src/commands/popover-show.js'

describe('PopoverShowCommand', () => {
  HTMLDivElement.prototype.hidePopover = function hidePopover(): void {
    const event = new window.Event('toggle')

    // @ts-expect-error ToggleEvent is undefined
    event.newState = 'closed'
    this.dispatchEvent(event)
  }

  HTMLDivElement.prototype.showPopover = function showPopover(): void {
    const event = new window.Event('toggle')

    // @ts-expect-error ToggleEvent is undefined
    event.newState = 'open'
    this.dispatchEvent(event)
  }

  it('should show popover', (test) => {
    document.body.innerHTML = '<div popover="manual"></div>'

    const divElement = document.querySelector('div')

    if (divElement !== null) {
      // jsdom does not support popovers, so a mock is needed
      const divElementShowPopover = test.mock.method(divElement, 'showPopover')
      const command = new PopoverShowCommand(divElement, divElement)

      command.execute()
      test.assert.equal(divElementShowPopover.mock.callCount(), 1)
    }
  })

  it('should hide popover on body click', async (test) => {
    document.body.innerHTML = '<div popover="manual"></div>'

    const divElement = document.querySelector('div')

    if (divElement !== null) {
      // jsdom does not support popovers, so a mock is needed
      const divElementHidePopover = test.mock.method(divElement, 'hidePopover')
      const divElementShowPopover = test.mock.method(divElement, 'showPopover')
      const command = new PopoverShowCommand(divElement, divElement)

      command.execute()
      test.assert.equal(divElementShowPopover.mock.callCount(), 1)

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      document.body.click()
      test.assert.equal(divElementHidePopover.mock.callCount(), 1)
    }
  })

  it('should not hide popover on popover click', async (test) => {
    document.body.innerHTML = '<div popover="manual"></div>'

    const divElement = document.querySelector('div')

    if (divElement !== null) {
      // jsdom does not support popovers, so a mock is needed
      const divElementHidePopover = test.mock.method(divElement, 'hidePopover')
      const divElementShowPopover = test.mock.method(divElement, 'showPopover')
      const command = new PopoverShowCommand(divElement, divElement)

      command.execute()
      test.assert.equal(divElementShowPopover.mock.callCount(), 1)

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      divElement.click()
      test.assert.equal(divElementHidePopover.mock.callCount(), 0)
    }
  })
})
