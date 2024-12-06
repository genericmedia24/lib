import type { StatefulElement } from '../state/stateful-element.js'
import { Command } from '../commander/command.js'

/**
 * Command options.
 */
export interface ElementSetStateCommandOptions {
  /**
   * The state key.
   */
  'state-key': string | string[]

  /**
   * The state value.
   */
  'state-value'?: string | string[]
}

/**
 * A command to set the state of an element.
 *
 * If `options['state-value']` is not defined the state value will be deleted.
 *
 * Multiple keys and values can be provided. They are paired in the order of their specification.
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
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-set-text-content?state-key=key-1"
 *   is="gm-div"
 * ></div>
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-set-text-content?state-key=key-2"
 *   is="gm-div"
 * ></div>
 * ```
 */
export class ElementSetStateCommand extends Command<StatefulElement, ElementSetStateCommandOptions> {
  /**
   * Executes the command.
   */
  public execute(): void {
    const stateKeys = Array.isArray(this.options['state-key'])
      ? this.options['state-key']
      : [this.options['state-key']]

    const stateValues = Array.isArray(this.options['state-value'])
      ? this.options['state-value']
      : [this.options['state-value']]

    stateKeys.forEach((stateKey, index) => {
      if (stateValues[index] === '') {
        this.targetElement.state?.delete(stateKey)
      } else {
        this.targetElement.state?.set(stateKey, stateValues[index])
      }
    })
  }
}
