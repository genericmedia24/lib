import type { Constructor } from 'type-fest'
import type { Command } from './command.js'

export class CustomCommands {
  private static instance?: CustomCommands

  public static create(): CustomCommands {
    CustomCommands.instance ??= new CustomCommands()
    return CustomCommands.instance
  }

  public commands: Record<string, Constructor<Command>> = {}

  public define(name: string, constructor: Constructor<Command>): void {
    this.commands[name] = constructor
  }

  public get(name: string): Constructor<Command, [unknown, Record<string, unknown>, HTMLElement]> | undefined {
    return this.commands[name]
  }
}
