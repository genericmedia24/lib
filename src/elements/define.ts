import type { Constructor } from 'type-fest'

/**
 * Adds custom elements to the registry.
 *
 * Constructs the external name by which the custom element can be used as tag or in attributes in the following way:
 *
 * 1. The postfix `Element` is removed from the class name.
 * 2. The remaining string is transformed from pascal case to kebab case.
 * 3. The prefix is added.
 *
 * If an element exists with the same name plus `HTML` as prefix, the custom element will be defined as an extension of the existing element. For example, if DialogElement is passed as a custom element, HTMLDialogElement will be found and DialogElement will be defined as extending HTMLDialogElement.
 *
 * @example
 * ```javascript
 * class ButtonElement extends HTMLButtonElement {}
 *
 * defineElements({
 *   ButtonElement
 * }, 'my-')
 *
 * console.log(window.customElements.get('my-button') === ButtonElement) // true
 * ```
 *
 * @param elements the object with custom elements
 * @param prefix the prefix to add to the external name of the custom elements
 * @param registry the registry to add the custom elements to
 * @param context the context of the custom elements, only used for testing
 */
export function defineElements(elements: Record<string, Constructor<HTMLElement>>, prefix = 'gm-', registry = window.customElements, context = window): void {
  Object
    .entries(elements)
    .forEach(([fullName, element]) => {
      const name = fullName
        .replace('Element', '')
        .replace(/(?<one>[a-z0–9])(?<two>[A-Z])/gu, '$1-$2')
        .toLowerCase()

      registry.define(`${prefix}${name}`, element, {
        extends: Object.hasOwn(context, `HTML${fullName}`)
          ? name
          : undefined,
      })
    })
}
