import type { Element } from '../elements/element.js'
import { Command } from '../commander/command.js'

export interface ElementToggleMarginCommandOptions {
  /**
   * Whether to toggle the margin immediately.
   */
  immediate?: string

  /**
   * The position of the element. Can be `start` or `end`, defaults to `start`.
   */
  position?: 'end' | 'start'
}

/**
 * Toggles the CSS `margin-inline` property of an element.
*
 * The position of the element is determined by `options.position`.
 *
 * Ensures that the transition is performed correctly so that the element will not flash when the document is loaded.
 *
 * If `options.immediate` is defined no transition will be performed.
 *
 * Uses the `hidden` attribute to determine whether the element should be hidden or shown.
 *
 * Executes a `hidden` command after the element is hidden and a `visible` command before it is shown.
 *
 * @example
 * ```html
 * <style>
 *   [hidden] {
 *     display: block;
 *   }
 *
 *   div.container {
 *     border: 1px solid;
 *     height: 100px;
 *     overflow: hidden;
 *     width: 250px;
 *   }
 *
 *   div[data-state="example"] {
 *     background-color: royalblue;
 *     color: white;
 *     height: 100%;
 *     transition-duration: 250ms;
 *     width: 75px;
 *   }
 * </style>
 * <button
 *   data-state="example"
 *   data-state-storage="none"
 *   data-onclick="element-toggle-state?state-key=open&state-on=true"
 *   is="gm-button"
 * >
 *   toggle
 * </button>
 * <div class="container">
 *   <div
 *     data-state="example"
 *     data-state-storage="none"
 *     data-onconnected="element-toggle-attribute?attribute-name=hidden&state-key=open&state-value=!true element-toggle-margin?immediate=true"
 *     data-onhidden="element-clear-html"
 *     data-onopenchanged="element-toggle-attribute?attribute-name=hidden&state-key=open&state-value=!true element-toggle-margin"
 *     data-onvisible="element-set-text-content?text-content=margin"
 *     is="gm-div"
 *     style="display: none"
 *     hidden
 *   ></div>
 * </div>
 * ```
 */
export class ElementToggleMarginCommand extends Command<Element, ElementToggleMarginCommandOptions> {
  public async execute(): Promise<void> {
    if (this.targetElement.state?.storage === 'idb') {
      await this.targetElement.state.loaded
    }

    const immediate = this.options.immediate === 'true'

    const property = this.options.position === undefined
      ? 'margin-inline-start'
      : `margin-inline-${this.options.position}`

    if (this.targetElement.hasAttribute('hidden')) {
      const { width } = this.targetElement.getBoundingClientRect()

      if (width === 0) {
        this.targetElement.commander.execute('hidden')
      } else if (immediate) {
        this.targetElement.style.setProperty('display', 'none')
        this.targetElement.style.setProperty(property, `-${width}px`)
        this.targetElement.commander.execute('hidden')
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty(property, '0px')

        const end = (): void => {
          this.targetElement.removeEventListener('transitioncancel', end)
          this.targetElement.removeEventListener('transitionend', end)
          this.targetElement.style.setProperty('display', 'none')
          this.targetElement.commander.execute('hidden')
        }

        this.targetElement.addEventListener('transitioncancel', end)
        this.targetElement.addEventListener('transitionend', end)

        window.setTimeout(() => {
          this.targetElement.style.removeProperty('transition-property')
          this.targetElement.style.setProperty(property, `-${width}px`)
        })
      }
    } else {
      this.targetElement.style.removeProperty('display')
      this.targetElement.commander.execute('visible')

      const { width } = this.targetElement.getBoundingClientRect()

      if (width === 0) {
        // do nothing
      } else if (immediate) {
        this.targetElement.style.removeProperty(property)
      } else {
        this.targetElement.style.setProperty('transition-property', 'none')
        this.targetElement.style.setProperty(property, `-${width}px`)

        const end = (): void => {
          this.targetElement.removeEventListener('transitioncancel', end)
          this.targetElement.removeEventListener('transitionend', end)
          this.targetElement.style.removeProperty(property)
        }

        this.targetElement.addEventListener('transitioncancel', end)
        this.targetElement.addEventListener('transitionend', end)

        window.setTimeout(() => {
          this.targetElement.style.removeProperty('transition-property')
          this.targetElement.style.setProperty(property, '0px')
        })
      }
    }
  }
}
