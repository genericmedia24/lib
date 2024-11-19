import type { Commander } from './commander.js'

export interface CommandableElement extends HTMLElement {
  /**
   * A {@link Commander}.
   */
  commander: Commander
}
