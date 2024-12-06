import type { Requester } from './requester.js'

/**
 * An element with a requester.
 */
export interface RequestableElement extends HTMLElement {
  /**
   * A `Requester`
   */
  requester: Requester
}
