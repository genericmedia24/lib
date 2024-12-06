import type { Commander } from './commander.js'

/**
 * An element with a commander.
 */
export interface CommandableElement extends HTMLElement {
  /**
   * A commander.
   */
  commander: Commander
}
