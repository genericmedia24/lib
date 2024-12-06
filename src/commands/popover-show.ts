import { Command } from '../commander/command.js'

/**
 * Shows a popover.
 *
 * Calls `targetElement.showPopover`.
 *
 * Listens for `click` events on `window` and closes the element when the user clicks on anything but the element itself.
 *
 * @example
 * ```html
 * <button
 *   data-onclick="popover-show@popover"
 *   type="button"
 *   is="gm-button"
 * >
 *   show
 * </button>
 * <div
 *   id="popover"
 *   popover="manual"
 * >
 *   <span>popover</span>
 *   <button
 *     data-onclick="popover-hide@popover"
 *     type="button"
 *     is="gm-button"
 *   >
 *     hide
 *   </button>
 * </div>
 * ```
 */
export class PopoverShowCommand extends Command<HTMLElement> {
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
