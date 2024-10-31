import type { InputElement } from '../elements/input.js'
import { Command } from '../helpers/command.js'
import { isPrimitive } from '../helpers/is-primitive.js'

export interface InputSetValueCommandOptions {
  'state-key'?: string
  'value'?: string
}

export class InputSetValueCommand extends Command<InputElement, InputSetValueCommandOptions> {
  public execute(options: InputSetValueCommandOptions): void {
    if (options.value !== undefined) {
      this.targetElement.value = options.value
    } else if (options['state-key'] !== undefined) {
      const value = this.targetElement.state?.get(options['state-key'])

      if (isPrimitive(value)) {
        this.targetElement.value = value?.toString() ?? ''
      }
    }
  }
}
