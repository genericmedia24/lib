import type { Constructor } from 'type-fest'

export function defineCustomElements(elements: Record<string, Constructor<HTMLElement>>): void {
  Object
    .entries(elements)
    .forEach(([fullName, element]) => {
      const name = fullName
        .replace('Element', '')
        .replace(/(?<one>[a-z0–9])(?<two>[A-Z])/gu, '$1-$2')
        .toLowerCase()

      window.customElements.define(`gm-${name}`, element, {
        extends: Object.hasOwn(window, `HTML${fullName}`)
          ? name
          : undefined,
      })
    })
}
