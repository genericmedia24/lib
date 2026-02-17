import type { Delegate } from './delegate.js'

export type DelegateElement = HTMLElement & Record<string, Delegate | undefined>
