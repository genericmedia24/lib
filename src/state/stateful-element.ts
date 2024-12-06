import type { State } from './state.js'

/**
 * An element with a state.
 */
export interface StatefulElement<StateValues = Record<string, unknown>> extends HTMLElement {
  /**
   * The state.
   */
  state?: State<StateValues>

  /**
   * Handles state changes.
   *
   * @param newValues the new values
   * @param oldValues the old values
   */
  stateChangedCallback: (newValues: Partial<StateValues>, oldValues?: Partial<StateValues>) => void
}
