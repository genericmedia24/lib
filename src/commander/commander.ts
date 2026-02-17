import type { Delegate } from '../delegator/index.js'
import { customCommands } from './custom-registry.js'

export interface CommandListener {
  attribute: {
    name: string
    value: string
  }
  listener: (event: Event) => void
  listenerElement: HTMLElement | Window
  type: string
}

export class Commander implements Delegate {
  static attributeNames = {
    active: 'data-on',
    passive: 'data-of',
  }

  static name = 'commander'

  private element?: HTMLElement

  private listeners = new Set<CommandListener>()

  static createFromElement(element: HTMLElement): Commander | undefined {
    return Array
      .from(element.attributes)
      .some((attribute) => {
        return (
          attribute.name.startsWith(Commander.attributeNames.active) ||
          attribute.name.startsWith(Commander.attributeNames.passive)
        )
      })
      ? new Commander()
      : undefined
  }

  connect(element: HTMLElement): void {
    this.element = element
    this.addEventListeners(Commander.attributeNames.active, false)
    this.addEventListeners(Commander.attributeNames.passive, true)
    this.element.dispatchEvent(new Event('connect'))
  }

  disconnect(): void {
    for (const entry of Array.from(this.listeners.values())) {
      entry.listenerElement.removeEventListener(entry.type, entry.listener)
      this.listeners.delete(entry)

      if (entry.attribute.name.startsWith('on')) {
        this.element?.setAttribute(entry.attribute.name, entry.attribute.value)
      }
    }

    this.element?.dispatchEvent(new Event('disconnect'))
  }

  private addEventListeners(prefix: string, passive: boolean): void {
    for (const attribute of Array.from(this.element?.attributes ?? [])) {
      if (attribute.name.startsWith(prefix)) {
        const type = attribute.name.slice(prefix.length)

        for (const commandString of attribute.value.split(' ')) {
          const commandUrl = new URL(`http://${commandString}`)
          const commandName = commandUrl.username === '' ? commandUrl.host : commandUrl.username
          const CommandConstructor = customCommands.get(commandName)

          if (CommandConstructor === undefined) {
            throw new Error(`Command "${commandName}" is undefined`)
          }

          const targetElement =
            commandUrl.username === ''
              ? this.element ?? null
              : commandUrl.username === 'window'
                ? window
                : document.getElementById(commandUrl.host)

          if (targetElement === null) {
            throw new Error(`Element "${commandUrl.host}" is undefined`)
          }

          const originElement = this.element

          if (originElement === undefined) {
            throw new Error(`Origin element is undefined`)
          }

          const options: Record<string, unknown> = {}

          for (const [
            key,
            value,
          ] of commandUrl.searchParams.entries()) {
            options[key] = value
          }

          const command = new CommandConstructor(originElement, targetElement, options)

          function listener(event: Event): void {
            void command.execute(event)
          }

          const listenerElement = passive
            ? targetElement
            : originElement

          listenerElement.addEventListener(type, listener)

          this.listeners.add({
            attribute: {
              name: attribute.name,
              value: attribute.value,
            },
            listener,
            listenerElement,
            type,
          })
        }

        if (attribute.name.startsWith('on')) {
          this.element?.removeAttribute(attribute.name)
        }
      }
    }
  }
}
