import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { PopoverHideCommand } from '../../src/commands/popover-hide.js'

describe('PopoverHideCommand', () => {
  HTMLDivElement.prototype.hidePopover = (): void => {}
  HTMLDivElement.prototype.showPopover = (): void => {}

  it('should hide popover', (test) => {
    document.body.innerHTML = '<div popover="manual"></div>'

    const divElement = document.querySelector('div')

    if (divElement !== null) {
      // jsdom does not support popovers, so a mock is needed
      const divElementHidePopover = test.mock.method(divElement, 'hidePopover')

      const command = new PopoverHideCommand(divElement, divElement)
      command.execute()

      test.assert.equal(divElementHidePopover.mock.callCount(), 1)
    }
  })
})
