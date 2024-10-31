export interface KeyBindingOptions {
  altKey?: boolean
  ctrlKey?: boolean
  key: string
  metaKey?: boolean
  shiftKey?: boolean
}

export class KeyBinding {
  private static readonly instances = new Map<string, KeyBinding>()

  public static create(options: KeyBindingOptions): KeyBinding {
    const key = KeyBinding.toString(options)
    let keyBinding = KeyBinding.instances.get(key)

    if (keyBinding === undefined) {
      keyBinding = new KeyBinding(options)
      KeyBinding.instances.set(key, keyBinding)
      keyBinding.start()
    }

    return keyBinding
  }

  public static toString(options: KeyBindingOptions): string {
    let key = ''

    if (
      options.ctrlKey === true ||
      options.metaKey === true
    ) {
      key += 'ctrl+'
    }

    if (options.shiftKey === true) {
      key += 'shift+'
    }

    if (options.altKey === true) {
      key += 'alt+'
    }

    return `${key}${options.key}`
  }

  public altKey: boolean

  public callbacks: Function[] = []

  public ctrlKey: boolean

  public key: string

  public metaKey: boolean

  public shiftKey: boolean

  public constructor(options: KeyBindingOptions) {
    this.altKey = options.altKey ?? false
    this.ctrlKey = options.ctrlKey ?? false
    this.key = options.key
    this.metaKey = options.metaKey ?? false
    this.shiftKey = options.shiftKey ?? false
  }

  public register(callback: Function): void {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback)
    }
  }

  public start(): this {
    window.addEventListener('keydown', this.handleKeydown.bind(this))
    return this
  }

  public stop(): this {
    window.removeEventListener('keydown', this.handleKeydown.bind(this))
    return this
  }

  public unregister(callback: Function): void {
    const index = this.callbacks.indexOf(callback)

    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (
      event.altKey === this.altKey &&
      event.ctrlKey === this.ctrlKey &&
      event.key.toLowerCase() === this.key &&
      event.metaKey === this.metaKey &&
      event.shiftKey === this.shiftKey
    ) {
      this.callbacks[this.callbacks.length - 1]?.()
    }
  }
}
