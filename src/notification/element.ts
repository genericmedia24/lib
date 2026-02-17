import { Notification } from './delegate.js'

export class NotificationElement extends HTMLElement {
  static attributeNames = {
    timeout: 'data-timeout',
  }

  static name = 'gm-notification'

  notification: Notification

  get timeout(): string {
    return this.notification.timeout.toString()
  }

  set timeout(value: null | string) {
    this.notification.timeout = value === null
      ? value
      : Number(value)
  }

  constructor() {
    super()
    this.notification = new Notification()
    this.notification.attributeNames = NotificationElement.attributeNames
    this.notification.element = this
  }

  connectedCallback(): void {
    this.notification.connect(this)
  }

  disconnectedCallback(): void {
    this.notification.disconnect()
  }
}
