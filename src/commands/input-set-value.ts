import type { InputElement } from '../elements/input.js'
import { Command } from '../commander/command.js'
import { isPrimitive } from '../util/is-primitive.js'

export interface InputSetValueCommandOptions {
  'state-key'?: string
  'value'?: string
}

export class InputSetValueCommand extends Command<InputElement, InputSetValueCommandOptions> {
  public execute(): void {
    if (this.options.value !== undefined) {
      this.targetElement.value = this.options.value
    } else if (this.options['state-key'] !== undefined) {
      const value = this.targetElement.state?.get(this.options['state-key'])

      if (isPrimitive(value)) {
        this.targetElement.value = value?.toString() ?? ''
      }
    }
  }
}
