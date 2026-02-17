import type { Constructor } from 'type-fest'
import type { Command } from './command.js'

export class CustomCommandRegistry {
  #commands = new Map<string, Constructor<Command>>()

  define(name: string, command: Constructor<Command>): void {
    this.#commands.set(name, command)
  }

  get(name: string): Constructor<Command> | undefined {
    return this.#commands.get(name)
  }
}

export const customCommands = new CustomCommandRegistry()
