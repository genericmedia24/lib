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

  public constructor(element: HTMLElement) {
    this.element = element
  }

  public execute(event: string, data?: Record<string, unknown>): void {
    Promise
      .all(this.commands[event]?.map(async (command) => {
        try {
          await command.execute({
            event,
            ...(isObject(command.options) ? command.options : {}),
            ...data,
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

  public start(): this {
    if (this.started) {
      return this
    }

    Object
      .entries(this.element.dataset)
      .filter(([key]) => {
        return key.startsWith('on')
      })
      .forEach(([key, value]) => {
        this.commands[key.slice(2)] = value
          ?.split(' ')
          .map((command) => {
            return Command.create(command, this.element)
          }) ?? []
      })

    this.started = true

    return this
  }
}
