import type { Constructor } from 'type-fest'

export function defineCustomElements(elements: Record<string, Constructor<HTMLElement>>): void {
  Object
    .values(elements)
    .forEach((element) => {
      const name = element.name
        .replace('Element', '')
        .replace(/(?<one>[a-z0–9])(?<two>[A-Z])/gu, '$1-$2')
        .toLowerCase()

      window.customElements.define(`gm-${name}`, element, {
        extends: Object.hasOwn(window, `HTML${element.name}`)
          ? name
          : undefined,
      })
    })
}
