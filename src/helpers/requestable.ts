import type { Requester } from './requester.js'

export interface RequestableElement extends HTMLElement {
  requester: Requester
}
