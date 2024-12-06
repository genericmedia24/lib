import { makeRe } from 'picomatch'
import type { Element } from '../elements/element.js'
import { Command } from '../commander/command.js'

export interface ElementToggleAttributeCommandOptions {
  'attribute-name': string | string[]
  'state-key': string | string[]
  'state-value': string | string[]
}

/**
 * Toggles the attribute of an element.
 *
 * Iterates over `options['state-key']` and checks if the corresponding value of the state matches `options['state-value']`. The matching pattern is interpreted as a glob. If there is a match there corresponding attribute is set.
 *
 * Multiple attributes, keys and values can be provided. They are paired in the order of their specification.
 *
 * @example
 * ```html
 * <input
 *   data-state="example"
 *   data-state-storage="none"
 *   data-oninput="input-set-state?state-key=key-1"
 *   is="gm-input"
 * >
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-toggle-attribute?state-key=key-1&state-value=abc&attribute-name=hidden"
 *   is="gm-div"
 * >
 *   disappears when input contains "abc"
 * </div>
 * ```
 */
export class ElementToggleAttributeCommand extends Command<Element, ElementToggleAttributeCommandOptions> {
  public async execute(): Promise<void> {
    if (this.targetElement.state?.storage === 'idb') {
      await this.targetElement.state.loaded
    }

    const attributeNames = Array.isArray(this.options['attribute-name'])
      ? this.options['attribute-name']
      : [this.options['attribute-name']]

    const stateKeys = Array.isArray(this.options['state-key'])
      ? this.options['state-key']
      : [this.options['state-key']]

    const stateValues = Array.isArray(this.options['state-value'])
      ? this.options['state-value']
      : [this.options['state-value']]

    const force = stateKeys.every((stateKey, index) => {
      const state = String(this.targetElement.state?.get(stateKey))

      return typeof stateValues[index] === 'undefined'
        ? false
        : makeRe(stateValues[index]).test(state)
    })

    attributeNames.forEach((attributeName) => {
      this.targetElement.toggleAttribute(attributeName, force)
    })
  }
}
