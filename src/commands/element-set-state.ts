import type { StatefulElement } from '../state/stateful-element.js'
import { Command } from '../commander/command.js'

export interface ElementSetStateCommandOptions {
  /**
   * The key(s) of the state.
   */
  'state-key': string | string[]

  /**
   * The value(s) of the state.
   */
  'state-value'?: string | string[]
}

/**
 * Sets the state of an element.
 *
 * If options{@link ElementSetStateCommandOptions['state-value']} is not defined the state value will be deleted.
 *
 * Multiple keys and values can be provided. They are paired in the order of their specification.
 *
 * @example
 * See [a live example](../../examples/commands.html#element-set-state) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-set-state.html}
 */
export class ElementSetStateCommand extends Command<StatefulElement, ElementSetStateCommandOptions> {
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
