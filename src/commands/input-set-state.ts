import type { InputElement } from '../elements/input.js'
import type { SelectElement } from '../elements/select.js'
import type { StatefulElement } from '../elements/stateful.js'
import type { TextareaElement } from '../elements/textarea.js'
import { Command } from '../helpers/command.js'

export interface InputSetStateCommandOptions {
  'check-validity'?: string
  'state-key'?: string | string[]
}

export class InputSetStateCommand extends Command<StatefulElement, InputSetStateCommandOptions, InputElement | SelectElement | TextareaElement> {
  public execute(): void {
    if (
      this.options['check-validity'] === undefined ||
      this.originElement.checkValidity()
    ) {
      const stateKeys = this.options['state-key'] === undefined
        ? [this.originElement.name]
        : Array.isArray(this.options['state-key'])
          ? this.options['state-key']
          : [this.options['state-key']]

      stateKeys.forEach((stateKey) => {
        if (this.originElement.value === '') {
          this.targetElement.state?.delete(stateKey)
        } else {
          this.targetElement.state?.set(stateKey, this.originElement.value)
        }
      })
    }
  }
}
