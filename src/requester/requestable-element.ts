import type { Requester } from './requester.js'

export interface RequestableElement extends HTMLElement {
  /**
   * A {@link Requester}
   */
  requester: Requester
}
