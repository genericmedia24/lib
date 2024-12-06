import type { RequestableElement } from '../requester/requestable-element.js'
import { Command } from '../commander/command.js'

/**
 * A command to abort the request of an element.
 *
 * Calls `targetElement.requester.abortController.abort`.
 *
 * @example
 * ```html
 * <form
 *   id="form"
 *   is="gm-form"
 * ></form>
 * <button
 *   data-onclick="element-abort-request@form"
 *   type="button"
 *   is="gm-button"
 * >
 *   abort
 * </button>
 * ```
 */
export class ElementAbortRequestCommand extends Command<RequestableElement> {
  /**
   * Executes the command.
   */
  public execute(): void {
    this.targetElement.requester.abortController?.abort()
  }
}
