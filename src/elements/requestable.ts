import type { Requester } from '../helpers/requester.js'

export interface RequestableElement extends HTMLElement {
  requester: Requester
}
