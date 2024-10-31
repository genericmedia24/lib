import { CustomCommands } from './custom-commands.js'

export abstract class Command<TargetElement = unknown, Options = unknown, OriginElement = HTMLElement> {
  public static customCommands = CustomCommands.create()

  public static create(command: string, self: HTMLElement): Command {
    const url = new URL(`http://${command}`)

    let commandName = url.username
    let elementId: string | undefined = url.hostname

    if (commandName === '') {
      commandName = elementId
      elementId = undefined
    }

    const Constructor = Command.customCommands.get(commandName)

    if (Constructor === undefined) {
      throw new Error(`Command "${commandName}" is undefined`)
    }

    let element: HTMLElement | undefined | Window = undefined

    if (elementId === 'window') {
      element = window
    } else if (typeof elementId === 'string') {
      element = document.getElementById(elementId) ?? undefined
    } else {
      element = self
    }

    if (element === undefined) {
      throw new Error (`Element "${elementId ?? ''}" is undefined)`)
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

    return new Constructor(element, options, self)
  }

  public options: Options

  public originElement: OriginElement

  public targetElement: TargetElement

  public constructor(targetElement: TargetElement, options: Options, originElement: OriginElement) {
    this.options = options
    this.originElement = originElement
    this.targetElement = targetElement
  }

  public abstract execute(options: Options): Promise<void> | void
}
