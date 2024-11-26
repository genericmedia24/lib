/**
 * A unit of behaviour.
 *
 * See [the guide](../../docs/guides/commander.md) for more information.
 *
 * @example
 * ```javascript
 * class ElementSetBackgroundCommand extends Command {
 *   execute() {
 *     this.targetElement.style.backgroundColor = this.options.color
 *   }
 * }
 *
 * window.customCommands = CommandRegistry.create()
 * window.customCommands.define('element-set-background', ElementSetBackgroundCommand)
 * ```
 */
export abstract class Command<TargetElement = unknown, Options = unknown, OriginElement = unknown> {
  /**
   * The options that inform the behaviour of the command.
   */
  public options: Options

  /**
   * The element that executes the command.
   */
  public originElement: OriginElement

  /**
   * The element on which the command should be executed.
   */
  public targetElement: TargetElement

  /**
   * Creates a new command.
   *
   * @param originElement the element that executes the command
   * @param targetElement the element on which the command should be executed
   * @param options the options that inform the behaviour of the command
   */
  public constructor(originElement: OriginElement, targetElement: TargetElement, options: Options) {
    this.options = options
    this.originElement = originElement
    this.targetElement = targetElement
  }

  /**
   * Executes the command.
   *
   * @param data data provided by the element that executes the command
   */
  public abstract execute(data: unknown): Promise<void> | void
}
