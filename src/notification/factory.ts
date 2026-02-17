import { Notification } from './delegate.js'
import { NotificationElement } from './element.js'

export interface NotificationOptions {
  timeout: number
}

export function notification(message: string, options?: Partial<NotificationOptions>): HTMLElement {
  const element = document.createElement(NotificationElement.name)

  if (element instanceof NotificationElement) {
    element.innerHTML = message
    element.timeout = options?.timeout?.toString() ?? null

    Notification.stack.push(() => {
      document.body.appendChild(element)
      element.notification.open()
    })

    if (Notification.current === undefined) {
      Notification.current = Notification.stack.shift()
      Notification.current?.()
    }

    return element
  }

  throw new Error('Notification could not be created')
}
