import type { RequestableElement } from '../requester/requestable-element.js'
import { Command } from '../commander/command.js'

export class ElementAbortRequestCommand extends Command<RequestableElement> {
  public execute(): void {
    this.targetElement.requester.abortController?.abort()
  }
}
