export abstract class Command<TargetElement = unknown, Options = unknown, OriginElement = unknown> {
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
