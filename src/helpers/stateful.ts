import type { State } from './state.js'

export interface StatefulElement<StateValues = Record<string, unknown>> extends HTMLElement {
  state?: State<StateValues>
  stateChangedCallback: (newValues: Partial<StateValues>, oldValues?: Partial<StateValues>) => void
}
