import type { StatefulElement } from '../state/stateful-element.js'
import { Command } from '../commander/command.js'

export interface ElementSetStateCommandOptions {
  'state-key': string | string[]
  'state-value': string | string[]
}

export class ElementSetStateCommand extends Command<StatefulElement, ElementSetStateCommandOptions> {
  public execute(): void {
    const stateKeys = Array.isArray(this.options['state-key'])
      ? this.options['state-key']
      : [this.options['state-key']]

    const stateValues = Array.isArray(this.options['state-value'])
      ? this.options['state-value']
      : [this.options['state-value']]

    stateKeys.forEach((stateKey, index) => {
      if (stateValues[index] === undefined) {
        this.targetElement.state?.delete(stateKey)
      } else {
        this.targetElement.state?.set(stateKey, stateValues[index])
      }
    })
  }
}
