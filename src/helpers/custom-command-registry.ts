import type { Constructor } from 'type-fest'
import type { Command } from './command.js'

export class CustomCommandRegistry {
  private static instance?: CustomCommandRegistry

  public static create(): CustomCommandRegistry {
    CustomCommandRegistry.instance ??= new CustomCommandRegistry()
    return CustomCommandRegistry.instance
  }

  public commands: Record<string, Constructor<Command>> = {}

  public create(command: string, originElement: HTMLElement, invert = false): Command {
    const url = new URL(`http://${command}`)

    let commandName = url.username
    let targetId: string | undefined = url.hostname

    if (commandName === '') {
      commandName = targetId
      targetId = undefined
    }

    const Constructor = this.get(commandName)

    if (Constructor === undefined) {
      throw new Error(`Command "${commandName}" is undefined`)
    }

    let targetElement: HTMLElement | undefined | Window = undefined

    if (targetId === 'window') {
      targetElement = window
    } else if (typeof targetId === 'string') {
      targetElement = document.getElementById(targetId) ?? undefined
    } else {
      targetElement = originElement
    }

    if (targetElement === undefined) {
      throw new Error (`Target element "${targetId ?? ''}" is undefined)`)
    }

    const options: Record<string, unknown> = {}

    url.searchParams.forEach((value, key) => {
      if (options[key] === undefined) {
        options[key] = value
      } else {
        if (!Array.isArray(options[key])) {
          options[key] = [options[key]]
        }

        if (Array.isArray(options[key])) {
          options[key].push(value)
        }
      }
    })

    if (invert) {
      return new Constructor(targetElement, originElement, options)
    }

    return new Constructor(originElement, targetElement, options)
  }

  public define(name: string, constructor: Constructor<Command>): void {
    this.commands[name] = constructor
  }

  public get(name: string): Constructor<Command, [HTMLElement | Window, HTMLElement | Window, Record<string, unknown>]> | undefined {
    return this.commands[name]
  }
}
