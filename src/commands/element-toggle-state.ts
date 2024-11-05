import type { StatefulElement } from '../helpers/stateful.js'
import { Command } from '../helpers/command.js'

export interface ElementToggleStateCommandOptions {
  'state-key': string
  'state-off'?: string
  'state-on': string
}

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
        if (stateOff[index] === undefined) {
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
