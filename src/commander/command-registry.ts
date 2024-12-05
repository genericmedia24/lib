import type { Constructor } from 'type-fest'
import type { Command } from './command.js'

/**
 * A registry to define and create custom commands.
 *
 * See [the guide](../../docs/guides/commander.md) for more information.
 *
 * @example
 * ```javascript
 * class ElementSetBackgroundCommand extends Command {
 *   execute() {
 *     this.targetElement.style.backgroundColor = this.options.color
 *   }
 * }
 *
 * window.customCommands = CommandRegistry.create()
 * window.customCommands.define('element-set-background', ElementSetBackgroundCommand)
 * ```
 */
export class CommandRegistry {
  /**
   * The singleton command registry.
   */
  private static instance?: CommandRegistry

  /**
   * Creates a singleton command registry.
   */
  public static create(): CommandRegistry {
    if (CommandRegistry.instance === undefined) {
      CommandRegistry.instance = new CommandRegistry()
    }

    return CommandRegistry.instance
  }

  /**
   * All the commands that have been defined.
   *
   * The key is the external name and the value is the command class.
   */
  public commands: Record<string, Constructor<Command>> = {}

  /**
   * Creates a new command. Used by {@link Commander} to instantiate commands.
   *
   * @example
   * ```javascript
   * window.customCommands.create('element-set-background@message?color=royalblue', originElement)
   * ```
   *
   * @param command the URI defining the command and all its properties
   * @param originElement the element that executes the command
   * @param invert whether to invert the origin and target element
   */
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
      targetId = ''
    }

    if (targetElement === undefined) {
      throw new Error (`Target element "${targetId}" is undefined)`)
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

  /**
   * Defines a new command.
   *
   * @example
   * ```javascript
   * class ElementSetBackgroundCommand extends Command {
   *   execute() {
   *     this.targetElement.style.backgroundColor = this.options.color
   *   }
   * }
   *
   * window.customCommands = CommandRegistry.create()
   * window.customCommands.define('element-set-background', ElementSetBackgroundCommand)
   * ```
   *
   * @param name the external name of the command
   * @param constructor the command class
   */
  public define(name: string, constructor: Constructor<Command>): void {
    this.commands[name] = constructor
  }

  /**
   * Gets a command class by its external name.
   *
   * @example
   * ```javascript
   * class ElementSetBackgroundCommand extends Command {
   *   execute() {
   *     this.targetElement.style.backgroundColor = this.options.color
   *   }
   * }
   *
   * window.customCommands = CommandRegistry.create()
   * window.customCommands.define('element-set-background', ElementSetBackgroundCommand)
   *
   * console.log(window.customCommands.get('element-set-background') === ElementSetBackgroundCommand) // true
   * ```
   *
   * @param name the external name of the command
   */
  public get(name: string): Constructor<Command, [HTMLElement | Window, HTMLElement | Window, Record<string, unknown>]> | undefined {
    return this.commands[name]
  }
}
