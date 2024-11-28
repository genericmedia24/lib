import type { Element } from '../elements/element.js'
import { Command } from '../commander/command.js'
import { isPrimitive } from '../util/is-primitive.js'

export interface ElementSetTextContentCommandData {
  /**
   * The text content.
   */
  'text-content'?: string
}

export interface ElementSetTextContentCommandOptions {
  /**
   * The state key.
   */
  'state-key'?: string

  /**
   * The text content.
   */
  'text-content'?: string
}

/**
 * Sets the text content of an element.
 *
 * If options{@link ElementSetTextContentCommandData['text-content']} is defined it will be used.
 *
 * Otherwise, if options{@link ElementSetTextContentCommandOptions['text-content']} is defined it will be used.
 *
 * Otherwise, if options{@link ElementSetTextContentCommandOptions['state-key']} is defined the state value of that key will be used.
 *
 * @example
 * See [a live example](../../examples/commands.html#element-set-text-content) of the code below.
 *
 * {@includeCode ../../docs/examples/commands/element-set-text-content.html}
 */
export class ElementSetTextContentCommand extends Command<Element, ElementSetTextContentCommandOptions> {
  public execute(data?: ElementSetTextContentCommandData): void {
    if (data?.['text-content'] !== undefined) {
      this.targetElement.textContent = data['text-content']
    } else if (this.options['text-content'] !== undefined) {
      this.targetElement.textContent = this.options['text-content']
    } else if (this.options['state-key'] !== undefined) {
      const value = this.targetElement.state?.get(this.options['state-key'])

      if (isPrimitive(value)) {
        this.targetElement.textContent = value?.toString() ?? ''
      }
    }
  }
}
