import type { StatefulElement } from '../elements/stateful.js'
import { Command } from '../helpers/command.js'

export interface ElementToggleStateCommandOptions {
  'state-key': string
  'state-off'?: string
  'state-on': string
}

export class ElementToggleStateCommand extends Command<StatefulElement, ElementToggleStateCommandOptions> {
  public async execute(options: ElementToggleStateCommandOptions): Promise<void> {
    if (this.targetElement.state?.storage === 'idb') {
      await this.targetElement.state.loaded
    }

    const stateKeys = Array.isArray(options['state-key'])
      ? options['state-key']
      : [options['state-key']]

    const stateOff = Array.isArray(options['state-off'])
      ? options['state-off']
      : [options['state-off']]

    const stateOn = Array.isArray(options['state-on'])
      ? options['state-on']
      : [options['state-on']]

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
