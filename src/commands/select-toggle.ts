import type { SelectElement } from '../elements/select.js'
import { Command } from '../helpers/command.js'

export class SelectToggleCommand extends Command<SelectElement> {
  public execute(): void {
    document
      .querySelectorAll<HTMLElement>(`[data-select-toggle=${this.targetElement.id}]`)
      .forEach((element) => {
        const force = element.dataset.selectToggleValue?.includes(this.targetElement.value) === false

        element.toggleAttribute('hidden', force)

        element
          .querySelectorAll<HTMLInputElement>('input, select, textarea')
          .forEach((input) => {
            input.toggleAttribute('disabled', force)
          })
      })
  }
}
