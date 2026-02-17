import style from './style.css'
import template from './template.html'

export class OptgroupElement extends HTMLElement {
  static name = 'gm-optgroup'

  constructor() {
    super()

    const shadowRoot = this.attachShadow({
      mode: 'open',
    })

    shadowRoot.innerHTML = `
      <style>${style}</style>
      ${template}
    `
  }
}
