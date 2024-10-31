import { makeRe } from 'picomatch'
import type { Element } from '../elements/element.js'
import { Command } from '../helpers/command.js'

export interface ElementToggleAttributeCommandOptions {
  'attribute-name': string | string[]
  'state-key': string | string[]
  'state-value': string | string[]
}

export class ElementToggleAttributeCommand extends Command<Element, ElementToggleAttributeCommandOptions> {
  public async execute(options: ElementToggleAttributeCommandOptions): Promise<void> {
    if (this.targetElement.state?.storage === 'idb') {
      await this.targetElement.state.loaded
    }

    const attributeNames = Array.isArray(options['attribute-name'])
      ? options['attribute-name']
      : [options['attribute-name']]

    const stateKeys = Array.isArray(options['state-key'])
      ? options['state-key']
      : [options['state-key']]

    const stateValues = Array.isArray(options['state-value'])
      ? options['state-value']
      : [options['state-value']]

    const force = stateKeys.every((stateKey, index) => {
      const state = String(this.targetElement.state?.get(stateKey))
      return makeRe(stateValues[index] ?? '').test(state)
    })

    attributeNames.forEach((attributeName) => {
      this.targetElement.toggleAttribute(attributeName, force)
    })
  }
}
