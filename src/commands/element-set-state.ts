import type { StatefulElement } from '../elements/stateful.js'
import { Command } from '../helpers/command.js'

export interface ElementSetStateCommandOptions {
  'state-key': string | string[]
  'state-value': string | string[]
}

export class ElementSetStateCommand extends Command<StatefulElement, ElementSetStateCommandOptions> {
  public execute(options: ElementSetStateCommandOptions): void {
    const stateKeys = Array.isArray(options['state-key'])
      ? options['state-key']
      : [options['state-key']]

    const stateValues = Array.isArray(options['state-value'])
      ? options['state-value']
      : [options['state-value']]

    stateKeys.forEach((stateKey, index) => {
      if (stateValues[index] === undefined) {
        this.targetElement.state?.delete(stateKey)
      } else {
        this.targetElement.state?.set(stateKey, stateValues[index])
      }
    })
  }
}
