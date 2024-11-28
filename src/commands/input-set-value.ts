import type { InputElement } from '../elements/input.js'
import { Command } from '../commander/command.js'
import { isPrimitive } from '../util/is-primitive.js'

export interface InputSetValueCommandData {
  /**
   * The value.
   */
  value?: string
}

export interface InputSetValueCommandOptions {
  /**
   * The state key.
   */
  'state-key'?: string

  /**
   * The value.
   */
  'value'?: string
}

/**
 * Sets the value of an `<input>`.
 *
 * If {@link InputSetValueCommandData.value | data.value} is defined it will be used.
 *
 * Otherwise, if {@link InputSetValueCommandOptions.value | options.value} is defined it will be used.
 *
 * Otherwise, if options{@link InputSetValueCommandOptions['state-key']} is defined the state value of that key will be used.
 *
 * @example
 * See [a live example](../../examples/commands.html#input-set-value) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/input-set-value.html}
 */
export class InputSetValueCommand extends Command<InputElement, InputSetValueCommandOptions> {
  public execute(data?: InputSetValueCommandData): void {
    if (data?.value !== undefined) {
      this.targetElement.value = data.value
    } else if (this.options.value !== undefined) {
      this.targetElement.value = this.options.value
    } else if (this.options['state-key'] !== undefined) {
      const value = this.targetElement.state?.get(this.options['state-key'])

      if (isPrimitive(value)) {
        this.targetElement.value = value?.toString() ?? ''
      }
    }
  }
}
