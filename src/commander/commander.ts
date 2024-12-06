import type { Command } from './command.js'
import type { CommandableElement } from './commandable-element.js'
import { CustomError } from '../util/custom-error.js'
import { isObject } from '../util/is-object.js'
import { CommandRegistry } from './command-registry.js'

declare global {
  interface HTMLElementEventMap {
    command: CustomEvent<CommandExecution>
  }
}

export interface CommandExecution {
  /**
   * The data that should be passed to the commands.
   */
  data: Record<string, unknown>

  /**
   * The name of the event for which commands should be executed.
   */
  event: string
}

/**
 * Executes commands on behalf of an element.
 *
 * @example
 * ```javascript
 * class ButtonElement extends HTMLButtonElement {
 *   commander = new Commander(this)
 *
 *   constructor() {
 *     super()
 *     this.addEventListener('click', this.handleClick.bind(this))
 *   }
 *
 *   handleClick(event) {
 *     this.commander.execute('click', {
 *       event,
 *     })
 *   }
 * }
 * ```
 */
export class Commander {
  /**
   * All commands that have been defined on the element with `data-on*`.
   */
  public commands: Record<string, Command[] | undefined> = {}

  /**
   * The parent element of the commander.
   */
  public element: HTMLElement

  /**
   * Whether the commander has been started.
   */
  public started = false

  protected handleCommandBound = this.handleCommand.bind(this)

  /**
   * All commands that have been defined on the element with both `data-on*` and `data-of*`.
   */
  #commands: Record<string, Command[]> = {}

  /**
   * Creates a new commander.
   *
   * @param element The parent element of the commander
   */
  public constructor(element: HTMLElement) {
    this.element = element
  }

  /**
   * Executes commands for an event.
   *
   * Handles the errors of individual commands, so it is guaranteed that all commands are executed even if one throws an error.
   *
   * @example
   * ```javascript
   * class ButtonElement extends HTMLButtonElement {
   *   handleClick(event) {
   *     this.commander.execute('click', {
   *       event,
   *     })
   *   }
   * }
   * ```
   *
   * @param event the name of the event for which commands should be executed
   * @param data the data that should be passed to the commands
   *
   */
  public execute(event: string, data?: Record<string, unknown>): void {
    void Promise.all(this.commands[event]?.map(async (command) => {
      try {
        await command.execute(data)
      } catch (error: unknown) {
        this.handleError(error)
      }
    }) ?? [])
  }

  /**
   * Executes commands for multiple events.
   *
   * @example
   * ```javascript
   * class ButtonElement extends HTMLButtonElement {
   *   someMethod() {
   *     this.commander.executeAll([
   *       {
   *         data: {
   *           key: 'some-value'
   *         },
   *         event: 'some-event',
   *       },
   *       {
   *         data: {
   *           key: 'another-value'
   *         },
   *         event: 'another-event',
   *       },
   *     ])
   *   }
   * }
   * ```
   *
   * @param commands the array of commands
   */
  public executeAll(commands: CommandExecution[]): void {
    commands.forEach(({ data, event }) => {
      this.execute(event, data)
    })
  }

  /**
   * Executes commands for state events.
   *
   * @param newValues the new state values
   * @param oldValues the old state values
   *
   * @example
   * ```javascript
   * class ButtonElement extends HTMLButtonElement {
   *   stateChangedCallback(newValues, oldValues) {
   *     this.commander.executeState(newValues, oldValues)
   *   }
   * }
   * ```
   *
   */
  public executeState(newValues: Record<string, unknown>, oldValues?: Record<string, unknown>): void {
    this.execute('statechanged', {
      newValues,
      oldValues,
    })

    Object
      .entries(newValues)
      .forEach(([key, value]) => {
        this.execute(`${key.toLowerCase()}changed`, {
          newValues: {
            [key]: value,
          },
          oldValues: {
            [key]: (oldValues)?.[key],
          },
        })
      })
  }

  /**
   * Handles an error on behalf of an element.
   *
   * If the error has an `event` property, that value will be used to determine which command should be executed.
   *
   * @example
   * The following setup will execute a `set-error-message` command on an element with ID `error-message` when an error occurred in `some-element` and was handled by its commander.
   *
   *
   * ```html
   * <some-element data-onerror="set-error-message@error-message"></some-element>
   * ```
   *
   * ```javascript
   * class SomeElement extends Element {
   *   commander = new Commander(this)
   *
   *   someMethod() {
   *     try {
   *       // do something that throws an error
   *     } catch (error) {
   *       this.commander.handleError(CustomError.from(error, {
   *         event: 'error'
   *       }))
   *     }
   *   }
   * }
   * ```
   *
   * @param error the error
   */
  public handleError(error: unknown): void {
    const customError = CustomError.from(error)
    const event = customError.event ?? 'error'

    this.execute(event, {
      error: customError,
    })

    console.error({ ...customError }, customError)
  }

  /**
   * Registers a command for an event.
   *
   * Used by the commander to register commands with itself or with commanders of other elements in the case of an inverted command.
   *
   * @param event the event
   * @param command the command
   */
  public register(event: string, command: Command): void {
    this.commands[event] ??= []
    this.commands[event].push(command)
  }

  /**
   * Starts the commander.
   *
   * Adds a listener for `command` events to the element.
   *
   * Registers all commands defined on the element with attributes starting with `data-on` or `data-of`.
   */
  public start(): this {
    if (!this.started) {
      this.started = true
      this.element.addEventListener('command', this.handleCommandBound)
      this.registerCommands('on')

      window.setTimeout(() => {
        this.registerCommands('of')
      })
    }

    return this
  }

  /**
   * Stops the commander.
   *
   * Removes the listener for `command` events from the element. Unregisters all commands.
   */
  public stop(): this {
    if (this.started) {
      this.started = false
      this.element.removeEventListener('command', this.handleCommandBound)
      this.unregisterCommands()
    }

    return this
  }

  /**
   * Unregisters a command for an event.
   *
   * Used by the commander to unregister commands from itself or from the commander of another element in the case of an inverted command.
   *
   * @param event the event
   * @param command the command
   */
  public unregister(event: string, command: Command): void {
    const index = this.commands[event]?.indexOf(command) ?? -1

    if (index > -1) {
      this.commands[event]?.splice(index, 1)
    }
  }

  /**
   * Handles `command` events.
   *
   * @param event the event
   */
  protected handleCommand(event: CustomEvent<CommandExecution>): void {
    this.execute(event.detail.event, event.detail.data)
  }

  /**
   * Registers all commands.
   *
   * @param prefix the prefix of the data attribute
   */
  private registerCommands(prefix: 'of' | 'on'): void {
    const registry = CommandRegistry.create()

    Object
      .entries(this.element.dataset)
      .filter(([key]) => {
        return key.startsWith(prefix)
      })
      .forEach(([key, value]) => {
        value
          ?.split(' ')
          .forEach((command) => {
            const invert = prefix === 'of'
            const commandObject = registry.create(command, this.element, invert)
            const { originElement } = commandObject

            const isCommandableElement = isObject<CommandableElement>(originElement, (element) => {
              return element.commander instanceof Commander
            })

            if (isCommandableElement) {
              const event = key.slice(2)

              originElement.commander.register(event, commandObject)
              this.#commands[event] ??= []
              this.#commands[event].push(commandObject)
            }
          })
      })
  }

  /**
   * Unregisters all commands.
   */
  private unregisterCommands(): void {
    Object
      .entries(this.#commands)
      .forEach(([event, commands]) => {
        commands.forEach((command) => {
          const { originElement } = command

          const isCommandableElement = isObject<CommandableElement>(originElement, (element) => {
            return element.commander instanceof Commander
          })

          if (isCommandableElement) {
            originElement.commander.unregister(event, command)
          }
        })
      })

    this.#commands = {}
  }
}
