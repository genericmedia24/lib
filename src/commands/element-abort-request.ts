import type { RequestableElement } from '../requester/requestable-element.js'
import { Command } from '../commander/command.js'

/**
 * Calls {@link RequestableElement.requester}.abortController.[abort](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort).
 *
 * @example
 * {@includeCode ../../docs/examples/commands/element-abort-request.html}
 */
export class ElementAbortRequestCommand extends Command<RequestableElement> {
  public execute(): void {
    this.targetElement.requester.abortController?.abort()
  }
}
