import type { CommandableElement } from '../elements/commandable.js'
import { Command } from './command.js'
import { CustomError } from './custom-error.js'
import { I18n } from './i18n.js'
import { isObject } from './is-object.js'

export type Commands = Array<{
  event: string
  options: Record<string, unknown>
}>

export class Commander {
  public commands: Record<string, Command[]> = {}

  public element: HTMLElement

  public i18n = I18n.create()

  public started = false

  #commands: Record<string, Command[]> = {}

  public constructor(element: HTMLElement) {
    this.element = element
  }

  public execute(event: string, options?: Record<string, unknown>): void {
    Promise
      .all(this.commands[event]?.map(async (command) => {
        try {
          await command.execute({
            event,
            ...(isObject(command.options) ? command.options : {}),
            ...options,
          })
        } catch (error: unknown) {
          this.handleError(error)
        }
      }) ?? [])
      .catch((error: unknown) => {
        this.handleError(error)
      })
  }

  public executeAll(commands: Commands): void {
    commands.forEach(({ event, options }) => {
      this.execute(event, options)
    })
  }

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

  public handleError(error: unknown): void {
    const customError = CustomError.from(error)
    const event = customError.event ?? 'error'

    this.execute(event, {
      data: customError.data,
      level: ['error', 'info', 'ok', 'warning'].includes(event)
        ? event
        : undefined,
      text: customError.code === undefined
        ? this.i18n.formatString('error', {
          params: {
            error: customError.message,
          },
        })
        : this.i18n.formatString(customError.code, {
          params: customError.data,
        }),
    })

    console.error({ ...customError }, customError)
  }

  public register(event: string, command: Command): void {
    this.commands[event] ??= []
    this.commands[event].push(command)
  }

  public start(): this {
    if (this.started) {
      return this
    }

    this.registerCommands('on')

    setTimeout(() => {
      this.registerCommands('of')
    })

    this.started = true

    return this
  }

  public stop(): this {
    if (!this.started) {
      return this
    }

    this.unregisterCommands()
    this.started = false

    return this
  }

  public unregister(event: string, command: Command): void {
    const index = this.commands[event]?.indexOf(command) ?? -1

    if (index > -1) {
      this.commands[event]?.splice(index, 1)
    }
  }

  private registerCommands(prefix: 'of' | 'on'): void {
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
            const event = key.slice(2)
            const commandObject = Command.create(command, this.element, invert)
            const { originElement } = commandObject

            const isCommandableElement = isObject<CommandableElement>(originElement, (element) => {
              return element.commander instanceof Commander
            })

            if (isCommandableElement) {
              originElement.commander.register(event, commandObject)
              this.#commands[event] ??= []
              this.#commands[event].push(commandObject)
            }
          })
      })
  }

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
