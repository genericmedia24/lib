import { Command } from '../commander/command.js'

/**
 * Shows a popover.
 *
 * Calls {@link targetElement}.[showPopover](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover).
 *
 * Listens for `click` events on [window](https://developer.mozilla.org/en-US/docs/Web/API/Window/window) and closes the element when the user clicks on anything but the element itself.
 *
 * @example
 * See [a live example](../../examples/commands.html#popover-show) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/popover-show.html}
 */
export class PopoverShowCommand extends Command<HTMLElement, unknown, HTMLButtonElement> {
  protected handleToggleBound = this.handleToggle.bind(this)

  protected handleWindowClickBound = this.handleWindowClick.bind(this)

  public execute(): void {
    this.targetElement.showPopover()

    window.setTimeout(() => {
      this.targetElement.addEventListener('toggle', this.handleToggleBound)
      window.addEventListener('click', this.handleWindowClickBound)
    })
  }

  protected handleToggle(): void {
    window.removeEventListener('click', this.handleWindowClickBound)
    this.targetElement.removeEventListener('toggle', this.handleToggleBound)
  }

  protected handleWindowClick(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      if (event.target.closest('[popover]') === null) {
        this.targetElement.hidePopover()
      }
    }
  }
}
