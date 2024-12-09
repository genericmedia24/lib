// prettier-ignore
import {
  Command,
  commands,
  defineCommands,
  defineElements,
  Element,
  elements,
  html,
  I18n,
  State,
} from 'https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm'

class ActivitybarElement extends Element {
  update() {
    const items = this.state?.get('items')
    const i18n = I18n.create()

    this.innerHTML = html`
      <div class="buttons">
        ${items?.map((item) => {
          return html`
            <button
              class="button"
              data-onclick="${item.onclick}"
              data-state="${item.state ?? 'sidebar'}"
              data-onpartchanged="${item.onpartchanged ?? 'sidebar-button-set-pressed'}"
              data-onconnected="${item.onpartchanged ?? 'sidebar-button-set-pressed'}"
              is="gm-button"
            >
              <span
                class="symbol"
                title="${i18n.formatString(`activitybar_${item.name}`)}"
              >
                ${item.symbol}
              </span>
            </button>
          `
        })}
      </div>
    `
  }
}

class AppElement extends Element {
  update() {
    this.innerHTML = html`
      <gm-activitybar
        class="activitybar"
        id="activitybar"
        data-color="contrast"
        data-state="activitybar"
        data-onconnected="element-update"
        data-onpartchanged="element-update"
      ></gm-activitybar>
      <gm-sidebar
        class="sidebar"
        id="sidebar"
        data-color="contrast"
        data-state="sidebar"
        data-onconnected="${[
          'element-toggle-attribute?attribute-name=hidden&state-key=open&state-value=!true',
          'element-toggle-margin?immediate=true',
        ].join(' ')}"
        data-onhidden="element-clear-html"
        data-onopenchanged="${[
          'element-toggle-attribute?attribute-name=hidden&state-key=open&state-value=!true',
          'element-toggle-margin',
        ].join(' ')}"
        data-onpartchanged="element-update"
        data-onvisible="element-update"
      ></gm-sidebar>
    `
  }
}

class ExtensionsElement extends Element {
  update() {
    const extensions = this.state?.get('extensions')
    const i18n = I18n.create()

    this.innerHTML = html`
      <div class="header">
        <span class="title">${i18n.formatString('extensions')}</span>
        </div>
      </div>
      <div class="body">
        <div class="accordion">
          ${extensions.map((extension) => {
            return html`
              <div class="header">
                <span class="symbol arrow">keyboard_arrow_down</span>
                <button class="button title" data-onclick="element-toggle-state@extension-${extension.id}-body?state-key=open&state-on=true" is="gm-button">${extension.name}</button>
              </div>
              <div
                class="body"
                id="extension-${extension.id}-body"
                data-state="extension-${extension.id}-body"
                data-onconnected="${[
                  'element-toggle-attribute?attribute-name=hidden&state-key=open&state-value=!true',
                  'element-toggle-flex?immediate=true',
                ].join(' ')}"
                data-onhidden="element-clear-html@extension-${extension.id}-sidebar-panel-structure"
                data-onopenchanged="${[
                  'element-toggle-attribute?attribute-name=hidden&state-key=open&state-value=!true',
                  'element-toggle-flex',
                ].join(' ')}"
                data-onvisible="element-update@extension-${extension.id}-sidebar-panel-structure?immediate=false"
                hidden
                is="gm-div"
              >
                <gm-extension class="section" id="extension-${extension.id}-sidebar-panel-structure" data-name="${extension.name}"></gm-extension>
              </div>
            `
          })}
        </div>
      </div>
    `
  }
}

class ExtensionElement extends Element {
  update() {
    this.innerHTML = this.dataset.name
  }
}

class SidebarElement extends Element {
  update() {
    const part = this.state?.get('part')

    if (part !== undefined) {
      // eslint-disable-next-line no-undef
      const url = new window.URL(`http://${part}`)
      const tag = url.hostname
      const id = tag.replace('gm-', '')

      const attributes = Object.entries(Object.fromEntries(url.searchParams))
        .map(([name, value]) => {
          return `data-${name}="${value}"`
        })
        .join(' ')

      this.innerHTML = `
        <${tag} id="${id}" class="panel" data-onconnected="element-update" ${attributes}></${tag}>
      `
    }
  }
}

class SidebarButtonSetStateCommand extends Command {
  execute() {
    const open = this.targetElement.state?.get('open')
    const part = this.targetElement.state?.get('part')

    if (this.options.part === part) {
      if (open === 'true') {
        this.targetElement.state?.set('open', 'false')
      } else {
        this.targetElement.state?.set('open', 'true')
      }
    } else if (part !== undefined) {
      this.targetElement.state?.set('open', 'true')
      this.targetElement.state?.set('part', this.options.part)
    }
  }
}

class SidebarButtonSetPressedCommand extends Command {
  execute() {
    this.targetElement.toggleAttribute('data-pressed', this.targetElement.dataset.onclick?.endsWith(this.targetElement.state?.get('part') ?? '') === true)
  }
}

// prettier-ignore
State
  .create({
    name: 'activitybar',
  })
  .load()
  .set('items', [
    {
      name: 'extensions',
      onclick: 'sidebar-button-set-state@sidebar?part=gm-extensions?state=extensions',
      symbol: 'database',
    },
  ])

// prettier-ignore
State
  .create({
    name: 'sidebar',
  })
  .load()
  .setnx('open', 'true')
  .setnx('part', 'gm-extensions')

// prettier-ignore
State
  .create({
    name: 'extensions',
  })
  .load()
  .set('extensions', [
    {
      id: 1,
      name: 'eslint',
    },
    {
      id: 2,
      name: 'kubernetes',
    },
  ])

defineCommands(commands)
defineElements(elements)

defineCommands({
  SidebarButtonSetPressedCommand,
  SidebarButtonSetStateCommand,
})

defineElements({
  ActivitybarElement,
  AppElement,
  ExtensionElement,
  ExtensionsElement,
  SidebarElement,
})
