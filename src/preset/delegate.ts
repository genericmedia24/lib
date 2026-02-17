import type { Delegate } from '../delegator/index.js'
import { customPresets } from './custom-registry.js'

export interface PresetSpec {
  filter: (element: HTMLElement, name: string) => boolean
  name: string
  preset: Preset
}

export class Preset implements Delegate {
  static attributeNames = {
    names: 'data-preset',
  }

  static name = 'preset'

  static createFromElement(element: HTMLElement): Preset | undefined {
    return element.hasAttribute(Preset.attributeNames.names)
      ? new Preset()
      : undefined
  }

  static defaultFilter(this: void, element: HTMLElement, name: string): boolean {
    return element.getAttribute(Preset.attributeNames.names)?.includes(name) === true
  }

  connect(element: HTMLElement): void {
    for (const spec of customPresets.getAll()) {
      if (spec.filter(element, spec.name)) {
        if (typeof spec.preset.connect !== 'undefined') {
          spec.preset.connect(element)
        }
      }
    }
  }

  disconnect(element: HTMLElement): void {
    for (const spec of customPresets.getAll()) {
      if (spec.filter(element, spec.name)) {
        if (typeof spec.preset.connect !== 'undefined') {
          spec.preset.disconnect(element)
        }
      }
    }
  }
}
