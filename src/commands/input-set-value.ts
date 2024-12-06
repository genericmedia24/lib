import type { InputElement } from '../elements/input.js'
import { Command } from '../commander/command.js'
import { isNil } from '../util/is-nil.js'
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
 * If `data.value` is defined it will be used.
 *
 * Otherwise, if `options.value` is defined it will be used.
 *
 * Otherwise, if `options['state-key']` is defined the state value of that key will be used.
 *
 * @example
 * ```html
 * <button
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onclick="element-set-state?state-key=key-1&state-value=value-1&state-key=key-2&state-value=value-2"
 *   is="gm-button"
 * >
 *   set
 * </button>
 * <input
 *   name="key-1"
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="input-set-value?state-key=key-1"
 *   data-onconnected="input-set-value?value=abc"
 *   is="gm-input"
 * >
 * <input
 *   name="key-2"
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="input-set-value?state-key=key-2"
 *   is="gm-input"
 * >
 * ```
 */
export class InputSetValueCommand extends Command<InputElement, InputSetValueCommandOptions> {
  public execute(data?: InputSetValueCommandData): void {
    if (data?.value !== undefined) {
      this.targetElement.value = data.value
    } else if (this.options.value !== undefined) {
      this.targetElement.value = this.options.value
    } else if (this.options['state-key'] !== undefined) {
      const value = this.targetElement.state?.get(this.options['state-key'])

      if (
        isPrimitive(value) &&
        !isNil(value)
      ) {
        this.targetElement.value = value.toString()
      }
    }
  }
}
