import type { InputElement } from '../elements/input.js'
import type { SelectElement } from '../elements/select.js'
import type { TextAreaElement } from '../elements/text-area.js'
import type { StatefulElement } from '../state/stateful-element.js'
import { Command } from '../commander/command.js'

export interface InputSetStateCommandOptions {
  /**
   * Whether to check the validity of the `<input>`.
   */
  'check-validity'?: string

  /**
   * The key(s) of the state.
   */
  'state-key'?: string | string[]
}

/**
 * Sets the state of an `<input>` based on its value.
 *
 * If `options['check-validity']` is defined the state will only be set if `originElement.checkValidity` returns `true`.
 *
 * If `options['state-key']` is not defined `originElement.name` will be used.
 *
 * If `originElement.value` is an empty string, the state value will be deleted.
 *
 * Multiple keys can be provided.
 *
 * @example
 * ```html
 * <input
 *   name="key-1"
 *   data-state="example"
 *   data-state-storage="none"
 *   data-oninput="input-set-state"
 *   is="gm-input"
 *   placeholder="Type something"
 * >
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-set-text-content?state-key=key-1"
 *   is="gm-div"
 * ></div>
 * ```
 */
export class InputSetStateCommand extends Command<StatefulElement, InputSetStateCommandOptions, InputElement | SelectElement | TextAreaElement> {
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
