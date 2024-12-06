import type { SetRequired } from 'type-fest'

export interface KeyBindingOptions {
  /**
   * Whether the alt-key should be pressed.
   */
  altKey?: boolean

  /**
   * Whether the ctrl-key should be pressed.
   */
  ctrlKey?: boolean

  /**
   * Which key should be pressed.
   */
  key: string

  /**
   * Whether the shift-key should be pressed.
   */
  shiftKey?: boolean
}

/**
 * Registers callbacks for any given key combination.
 *
 * If the key combination is pressed, the callback is called that was added last.
 *
 * Can be used to close `<popover>`s and `<dialog>`s in the correct order when the Escape key is pressed.
 *
 * @example
 * ```html
 * <body>
 *   <dialog id="dialog-1">Dialog 1</dialog>
 *   <dialog id="dialog-2">Dialog 2</dialog>
 * </body>
 * ```
 *
 * ```javascript
 * const keyBinding = KeyBinding.create({
 *   key: 'escape'
 * })
 *
 * const dialog1 = document.getElementById('dialog-1')
 * const dialog2 = document.getElementById('dialog-2')
 *
 * function close1() {
 *   dialog1.close()
 *   keyBinding.unregister(close1)
 * }
 *
 * function close2() {
 *   dialog2.close()
 *   keyBinding.unregister(close2)
 * }
 *
 * dialog1.show()
 * keyBinding.register(close1)
 *
 * dialog2.show()
 * keyBinding.register(close2)
 * ```
 */
export class KeyBinding {
  /**
   * The singleton key bindings.
   */
  private static readonly instances = new Map<string, KeyBinding>()

  /**
   * Creates a singleton key binding. For every key combination there is one key binding.
   *
   * Calls `start` once, after creating the key binding.
   *
   * @param options the options
   */
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

  /**
   * Creates a string representation of a key combination.
   *
   * @example
   * ```javascript
   * const string = KeyBinding.toString({
   *   ctrlKey: true,
   *   key: 'enter'
   * })
   *
   * console.log(string === 'ctrl+enter') // true
   * ```
   *
   * @param options the options
   */
  public static toString(options: SetRequired<Partial<KeyBindingOptions>, 'key'>): string {
    let key = ''

    if (options.ctrlKey === true) {
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

  /**
   * Whether the alt-key should be pressed.
   */
  public altKey: boolean

  /**
   * The callbacks.
   */
  public callbacks: Array<() => void> = []

  /**
   * Whether the ctrl-key should be pressed.
   */
  public ctrlKey: boolean

  /**
   * Which key should be pressed.
   */
  public key: string

  /**
   * Whether the shift-key should be pressed.
   */
  public shiftKey: boolean

  /**
   * The bound keydown handler.
   */
  protected handleKeydownBound = this.handleKeydown.bind(this)

  /**
   * Creates a key binding.
   *
   * @param options the options
   */
  public constructor(options: KeyBindingOptions) {
    this.altKey = options.altKey ?? false
    this.ctrlKey = options.ctrlKey ?? false
    this.key = options.key
    this.shiftKey = options.shiftKey ?? false
  }

  /**
   * Registers a callback.
   *
   * Does not register the same callback more than once.
   *
   * @param callback the callback
   */
  public register(callback: () => void): void {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback)
    }
  }

  /**
   * Starts listening for `keydown` events on `window`.
   */
  public start(): this {
    window.addEventListener('keydown', this.handleKeydownBound)

    return this
  }

  /**
   * Stops listening for `keydown` events on `window`.
   */
  public stop(): this {
    window.removeEventListener('keydown', this.handleKeydownBound)

    return this
  }

  /**
   * Unregisters a callback.
   *
   * @param callback the callback
   */
  public unregister(callback: () => void): void {
    const index = this.callbacks.indexOf(callback)

    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  /**
   * Handles a keydown event.
   *
   * @param event the event
   */
  protected handleKeydown(event: KeyboardEvent): void {
    if (
      event.altKey === this.altKey &&
      event.key.toLowerCase() === this.key &&
      event.shiftKey === this.shiftKey && (
        event.ctrlKey === this.ctrlKey ||
        event.metaKey === this.ctrlKey
      )
    ) {
      this.callbacks[this.callbacks.length - 1]?.()
    }
  }
}
