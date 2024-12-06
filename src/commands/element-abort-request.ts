import type { RequestableElement } from '../requester/requestable-element.js'
import { Command } from '../commander/command.js'

/**
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
  public execute(): void {
    this.targetElement.requester.abortController?.abort()
  }
}
