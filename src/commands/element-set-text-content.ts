import type { Element } from '../elements/element.js'
import { Command } from '../commander/command.js'
import { isNil } from '../util/is-nil.js'
import { isPrimitive } from '../util/is-primitive.js'

/**
 * Command data.
 */
export interface ElementSetTextContentCommandData {
  /**
   * The text content.
   */
  'text-content'?: string
}

/**
 * Command options.
 */
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
 * A command to set the text content of an element.
 *
 * If `options['text-content']` is defined it will be used.
 *
 * Otherwise, if `options['text-content']` is defined it will be used.
 *
 * Otherwise, if `options['state-key']` is defined the state value of that key will be used.
 *
 * @example
 * ```html
 * <input
 *   name="key-1"
 *   data-state="example"
 *   data-state-storage="none"
 *   data-oninput="input-set-state"
 *   is="gm-input"
 * >
 * <div
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onstatechanged="element-set-text-content?state-key=key-1"
 *   is="gm-div"
 * ></div>
 * ```
 */
export class ElementSetTextContentCommand extends Command<Element, ElementSetTextContentCommandOptions> {
  /**
   * Executes the command.
   *
   * @param data the data
   */
  public execute(data?: ElementSetTextContentCommandData): void {
    if (data?.['text-content'] !== undefined) {
      this.targetElement.textContent = data['text-content']
    } else if (this.options['text-content'] !== undefined) {
      this.targetElement.textContent = this.options['text-content']
    } else if (this.options['state-key'] !== undefined) {
      const value = this.targetElement.state?.get(this.options['state-key'])

      if (
        isPrimitive(value) &&
        !isNil(value)
      ) {
        this.targetElement.textContent = value.toString()
      }
    }
  }
}
