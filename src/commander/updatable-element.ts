/**
 * An element that can be updated.
 */
export interface UpdatableElement extends HTMLElement {
  /**
   * Updates the element.
   *
   * @param options the options
   */
  update: (options?: Record<string, unknown>) => Promise<void> | void
}
