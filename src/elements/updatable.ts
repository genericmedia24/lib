export interface UpdatableElement extends HTMLElement {
  update: (options?: Record<string, unknown>) => Promise<void> | void
}
