import type { Constructor } from 'type-fest'
import type { Command } from './command.js'
import { CustomCommandRegistry } from './custom-command-registry.js'

export function defineCustomCommands(commands: Record<string, Constructor<Command>>): void {
  const customCommandRegistry = CustomCommandRegistry.create()

  Object
    .entries(commands)
    .forEach(([fullName, command]) => {
      const name = fullName
        .replace('Command', '')
        .replace(/(?<one>[a-z0–9])(?<two>[A-Z])/gu, '$1-$2')
        .toLowerCase()

      customCommandRegistry.define(name, command)
    })
}
