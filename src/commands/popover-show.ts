import { Command } from '../commander/command.js'

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
