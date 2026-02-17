export abstract class Command<TargetElement = HTMLElement, OriginElement = HTMLElement, Options = unknown> {
  options: Options

  originElement: OriginElement

  targetElement: TargetElement

  constructor(originElement: OriginElement, targetElement: TargetElement, options: Options) {
    this.options = options
    this.originElement = originElement
    this.targetElement = targetElement
  }

  abstract execute(event: Event): Promise<void> | void
}
