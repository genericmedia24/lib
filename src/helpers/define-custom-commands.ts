import type { Constructor } from 'type-fest'
import type { Command } from './command.js'
import { CustomCommands } from './custom-commands.js'

export function defineCustomCommands(commands: Record<string, Constructor<Command>>): void {
  const customCommands = CustomCommands.create()

  Object
    .values(commands)
    .forEach((command) => {
      const name = command.name
        .replace('Command', '')
        .replace(/(?<one>[a-z0–9])(?<two>[A-Z])/gu, '$1-$2')
        .toLowerCase()

      customCommands.define(name, command)
    })
}
