import type { State } from './delegate.js'

export interface StateElement<Values = unknown> extends HTMLElement {
  state: State<Values>
}
