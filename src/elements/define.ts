import type { Constructor } from 'type-fest'

/**
 * Adds custom elements to the registry.
 *
 * Constructs the external name by which the custom element can be used as tag or in attributes in the following way:
 *
 * 1. The postfix "Element" is removed from the class name.
 * 2. If the custom element is an extension of a native element, the remaining string is transformed to lower case. Otherwise it is transformed from pascal case to kebab case.
 * 3. The prefix is added.
 *
 * To determine whether a custom element is an extension of a native element the context is checked for the existence of a native element with the same name plus "HTML" as prefix.
 *
 * For example, if DialogElement is passed as a custom element, HTMLDialogElement will be found and DialogElement will be defined as extending HTMLDialogElement.
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
      const name = Object.hasOwn(context, `HTML${fullName}`)
        ? fullName
          .replace('Element', '')
          .toLowerCase()
        : fullName
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
