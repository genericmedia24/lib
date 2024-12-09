# State

Large application benefit from centralised state management. All the custom elements defined in the library have a state.

Detailed documentation can be found in the source code. See a [live version](https://genericmedia24.github.io/lib/state.html) of the code below.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>State</title>
    <script type="module">
      // prettier-ignore
      import {
        Command,
        CommandRegistry,
        defineCommands,
        defineElements,
        commands,
        elements
      } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/dist/index.min.mjs"

      class DivSetGreetingCommand extends Command {
        execute() {
          const username = this.originElement.state.get("username") ?? ""
          this.originElement.textContent = `${this.options.prefix} ${username}`
        }
      }

      window.customCommands = CommandRegistry.create()
      window.customCommands.define("div-set-greeting", DivSetGreetingCommand)

      defineCommands(commands)
      defineElements(elements)
    </script>
  </head>

  <body>
    <input
      name="username"
      data-state="person"
      data-oninput="input-set-state"
      is="gm-input"
    >
    <div
      data-state="person"
      data-onconnected="div-set-greeting?prefix=hello"
      data-onusernamechanged="div-set-greeting?prefix=hello"
      is="gm-div"
    ></div>
  </body>
</html>
```

## Definition

First of all, a named state is defined on both elements:

```html
data-state="person"
```

The state is changed by the input by calling a custom command named `input-set-state` everytime the input event is triggered:

```html
data-oninput="input-set-state"
```

Note that in this case no ID of a target element is given, which means that the `originElement` and the `targetElement` of the command will be the same.

Note also that both elements have no ID: the coupling is achieved entirely through the state.

## Callback

Elements that have a state, register themselves with the state. When the state has changed it can call a special method on these elements called `stateChangedCallback`. The elements delegate this call to their commander which then executes commands defined on the elements in two ways:

1. As `onstatechanged="name-of-the-command"`. This command is always executed.

2. As `on*changed="name-of-the-command"` where the asterisk can be replaced by any lowercase alphanumerical string referring to a value in the state. This command is only executed when the referred value has changed.

So, in the example above the input sets a value called "username" (the name of the input) on the state called "person". When the value is changed, the command defined in `data-onusernamechanged` is executed.

Elements also execute commands everytime they are connected to or disconnected from the DOM:

```html
data-onconnected="div-set-greeting?prefix=hello"
```

## Storage

The state is saved to localStorage, so when the page is loaded and the element connected to the DOM, the greeting will be visible with the last username entered by the user.

It is also possible to use IndexedDB as the storage provider for the state:

```html
<div
  data-state="person"
  data-state-storage="idb"
  data-onconnected="div-set-greeting?prefix=hello"
  data-onusernamechanged="div-set-greeting?prefix=hello"
  is="gm-div"
></div>
<input
  name="username"
  data-state="person"
  data-state-storage="idb"
  data-oninput="input-set-state"
  is="gm-input"
>
```

Because the API of IndexedDB is asynchronous, it is important to wait for the data to be loaded, primarily in the context of `data-onconnected`. To do so, the command should be rewritten like:

```javascript
class DivSetGreetingCommand extends Command {
  async execute() {
    await this.originElement.state.loaded

    const username = this.originElement.state.get("username") ?? ""

    this.originElement.textContent = `${this.options.prefix} ${username}`
  }
}
```

## Custom Elements

A state can be used alongside a [commander](../commander/README.md) in a custom element. The custom button element included in the library looks partly like this:

```javascript
class ButtonElement extends HTMLButtonElement {
  commander = new Commander(this)

  state

  constructor() {
    super()
    this.addEventListener("click", this.handleClick.bind(this))
  }

  connectedCallback() {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute("connected")
  }

  disconnectedCallback() {
    this.state?.unregister(this)
    this.commander.execute("disconnected")
    this.commander.stop()
  }

  stateChangedCallback(newValues, oldValues) {
    this.commander.executeState(newValues, oldValues)
  }

  handleClick(event) {
    this.commander.execute("click", {
      event,
    })
  }
}
```

In `connectedCallback` the element should set up the state once and register itself with it. It should also start the commander.

In `disconnectedCallback` the element should unregister itself from the state and stop the commander.

In general it is advised to move all behavioural code from custom elements to custom commands and use custom elements exclusively for structural purposes and event delegation.
