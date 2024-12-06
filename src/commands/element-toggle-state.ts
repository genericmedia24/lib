import type { StatefulElement } from '../state/stateful-element.js'
import { Command } from '../commander/command.js'

export interface ElementToggleStateCommandOptions {
  'state-key': string | string[]
  'state-off'?: string | string[]
  'state-on': string | string[]
}

/**
 * Toggles the state of an element.
 *
 * Iterates over `options['state-key']`.
 *
 * If the current corresponding state value does not match `options['state-on']` the state value will be set to `options['state-on']`.
 *
 * Otherwise the state value is set to `options['state-off']`. If `options['state-off']` is not defined, the state value will be deleted.
 *
 * Multiple keys, on and off values can be provided. They are paired in the order of their specification.
 *
 * @example
 * ```html
 * <button
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onclick="element-toggle-state?state-key=key-1&state-on=on-1&state-off=off-1&state-key=key-2&state-on=on-2"
 *   is="gm-button"
 * >
 *   toggle
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
export class ElementToggleStateCommand extends Command<StatefulElement, ElementToggleStateCommandOptions> {
  public async execute(): Promise<void> {
    if (this.targetElement.state?.storage === 'idb') {
      await this.targetElement.state.loaded
    }

    const stateKeys = Array.isArray(this.options['state-key'])
      ? this.options['state-key']
      : [this.options['state-key']]

    const stateOff = Array.isArray(this.options['state-off'])
      ? this.options['state-off']
      : [this.options['state-off']]

    const stateOn = Array.isArray(this.options['state-on'])
      ? this.options['state-on']
      : [this.options['state-on']]

    stateKeys.forEach((stateKey, index) => {
      const state = this.targetElement.state?.get(stateKey)

      if (state === stateOn[index]) {
        if (stateOff[index] === '') {
          this.targetElement.state?.delete(stateKey)
        } else {
          this.targetElement.state?.set(stateKey, stateOff[index])
        }
      } else {
        this.targetElement.state?.set(stateKey, stateOn[index])
      }
    })
  }
}
