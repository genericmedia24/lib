import { CustomCommands } from './custom-commands.js'

export abstract class Command<TargetElement = unknown, Options = unknown, OriginElement = unknown> {
  public static customCommands = CustomCommands.create()

  public static create(command: string, originElement: HTMLElement, invert = false): Command {
    const url = new URL(`http://${command}`)

    let commandName = url.username
    let targetId: string | undefined = url.hostname

    if (commandName === '') {
      commandName = targetId
      targetId = undefined
    }

    const Constructor = Command.customCommands.get(commandName)

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

  public options: Options

  public originElement: OriginElement

  public targetElement: TargetElement

  public constructor(originElement: OriginElement, targetElement: TargetElement, options: Options) {
    this.options = options
    this.originElement = originElement
    this.targetElement = targetElement
  }

  public abstract execute(data: unknown): Promise<void> | void
}
