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
 * Iterates over options{@link ElementToggleAttributeCommandOptions['state-key']} and checks if the corresponding value of the state matches options{@link ElementToggleAttributeCommandOptions['state-value']}. The matching pattern is interpreted as a glob (see [picomatch](https://github.com/micromatch/picomatch)). If there is a match there corresponding attribute is set.
 *
 * Multiple attributes, keys and values can be provided. They are paired in the order of their specification.
 *
 * @example
 * See [a live example](../../examples/commands.html#element-toggle-attribute) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-toggle-attribute.html}
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
