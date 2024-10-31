import type { Commander } from '../helpers/commander.js'

export interface CommandableElement extends HTMLElement {
  commander: Commander
}
