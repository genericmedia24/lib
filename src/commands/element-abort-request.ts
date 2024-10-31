import type { RequestableElement } from '../elements/requestable.js'
import { Command } from '../helpers/command.js'

export class ElementAbortRequestCommand extends Command<RequestableElement> {
  public execute(): void {
    this.targetElement.requester.abortController?.abort()
  }
}
