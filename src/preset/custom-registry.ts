import { Preset, type PresetSpec } from './delegate.js'

export class CustomPresetRegistry {
  #presets: PresetSpec[] = []

  define(name: PresetSpec['name'], preset: PresetSpec['preset'], filter: PresetSpec['filter'] = Preset.defaultFilter): void {
    this.#presets.push({
      filter,
      name,
      preset,
    })
  }

  get(name: string): PresetSpec | undefined {
    return this.#presets.find((preset) => {
      return preset.name === name
    })
  }

  getAll(): PresetSpec[] {
    return this.#presets
  }
}

export const customPresets = new CustomPresetRegistry()
