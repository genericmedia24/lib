import type { Commander } from './commander.js'

export interface CommandableElement extends HTMLElement {
  commander: Commander
}
