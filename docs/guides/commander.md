# Custom Commands

## Problem description

User-facing applications generally consist of structure, styling and behaviour. In the world of web applications these architectural components are built with three different languages: HTML, CSS and JavaScript.

Difficulties arise, as always, at the interface of the components. The main question is: how can structure and behaviour be coupled efficiently and securely?

Efficiency is defined in terms of how easy it is to read and write the syntax that is necessary to establish the coupling. The less syntax the better.

## Existing solutions

### HTML

HTML has the possibility to embed CSS and JavaScript through attributes. Because meaning depends on context, this may be benificial in cases where the amount of CSS and JavaScript is limited.

But because every language has its own syntax and semantics the combination of languages in one document is detrimental to readability when the amount of CSS and JavaScript needed for styling and behaviour increases.

(Embedded JavaScript has also been the source of many security problems. Meta-syntax like CSP has been designed to solve these problems. It would be better to take away the source of the problems, consequently reducing the amount of meta-syntax.)

### JavaScript

In JavaScript it is possible to listen for events triggered by elements in the application. In the case of a few links between structure and behaviour (i.e. elements and event handlers) this may suffice. But in larger applications this way of coupling it too loose.

It is not obvious from reading the structural code which behaviour is involved in the functioning of the application. And from reading the behavioural code is not obvious in which structural context events are handled.

### Hybrids

The drawbacks of both approaches has led many people to design new syntaxes for coupling structure and behaviour.

React is a JavaScript-first approach with syntactic innovations in both JavaScript and HTML to ensure the coupling between both.

AngularJS took an HTML-first approach using special attributes to bind controllers to elements. Nowadays, Angular is a JavaScript-first approach with the Component as the primary construct to organise code.

Htmx is one of the latest additions to the collection of hybrid solutions. It is an HTML-first approach with special attributes to trigger limited predefined behaviour without the need to write JavaScript. In some cases JavaScript can be added to break free from the boundaries of the predefined behaviour.

The drawbacks of hybrids are manifold. One needs to learn a great deal of new syntax in order to develop an application. One needs to include framework code in order to make the application function. One needs transpilers in order to untangle hybrid language features into native language features.

It would be better to develop a solution that introduces (almost) no new syntax, provides for reading structural code with an understanding of the coupled behaviour, while allowing the code of the various languages to be written in files of their respective media (MIME) types.

## New solution

Enter Custom Commands, the long-lost pal of Custom Elements.

### Basic example

See [a live example](../examples/commander.html) of the code below.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Commander</title>
    <script type="module">
      // prettier-ignore
      import { 
        Command,
        CommandRegistry,
        defineElements,
        elements
      } from 'https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm'

      class ElementSetBackgroundCommand extends Command {
        execute() {
          this.targetElement.style.backgroundColor = this.options.color
        }
      }

      window.customCommands = CommandRegistry.create()
      window.customCommands.define('element-set-background', ElementSetBackgroundCommand)

      defineElements(elements)
    </script>
  </head>

  <body>
    <div id="message">hello world</div>
    <button
      data-onclick="element-set-background@message?color=royalblue"
      is="gm-button"
    >
      set background
    </button>
  </body>
</html>
```

#### Explanation

First, an event attribute is added to the button:

```html
data-onclick="element-set-background@message?color=royalblue"
```

The value of the attribute is an URI. The part before the @ is the name of the command. The part after the @ is the ID of the target element of the command. The part after the ? contains the options of the command.

The command is added to the registry with:

```javascript
window.customCommands.define('element-set-background', ElementSetBackgroundCommand)
```

And the command is defined as a class with:

```javascript
class ElementSetBackgroundCommand extends Command {
  execute() {
    this.targetElement.style.backgroundColor = this.options.color
  }
}
```

A command should implement an `execute` method. The command has several properties, two of which are shown in the example: `targetElement` and `options`, which are defined by the URI in the attribute.

The command is invoked by a `Commander`. The commander is a property of all the custom elements defined in the library. For more information See the elaboration below.

The type of the custom element is defined by the `is` attribute of the button:

```html
is="gm-button"
```

This custom button element is part of the library and defined by calling a helper function:

```javascript
defineElements(elements)
```

#### Elaboration

The specification of the custom button element looks partly like this:

```javascript
class ButtonElement extends HTMLButtonElement {
  commander = new Commander(this)

  constructor() {
    super()
    this.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick(event) {
    this.commander.execute('click', {
      event,
    })
  }
}
```

The native click event is bound and delegated to the commander in the event handler. The commander looks for attributes on the button element with the name `data-onclick` and executes the defined command.

The second argument of the `execute` call is a data object that is passed to the `execute` function of the command. So the mouse event is accessible by the command as follows:

```javascript
class ElementSetBackgroundCommand extends Command {
  execute(data) {
    console.log(data.event.target === this.originElement) // true
  }
}
```

In the example above a new atribute of the command is introduced, the `originElement`. This is the element containing the binding attribute defining the command, in this case the button with the `data-onclick` attribute.

A command is instantiated for every element. So, for multiple clicks of the same element, the same command is used. But for multiple clicks of different elements, a different command for each element is used.

It is also possible to define multiple commands in one attribute. This is done by adding multiple URIs, seperated by a space:

```html
data-onclick="element-set-background@message?color=royalblue other-command@other-element"
```

#### Inversion

It is possible to invert the relationship between the target and the origin element, effectively creating an observer/observable pattern:

```html
<body>
  <div
    data-ofclick="element-set-background@button?color=royalblue"
    is="gm-div"
  >
    hello world
  </div>
  <button
    id="button"
    is="gm-button"
  >
    set background
  </button>
</body>
```

Note the change of the name of the attribute: `data-ofclick` instead of `data-onclick`. Because the relationship is inverted, the same custom command can be used to set the background, because the target element of a custom command bound by `data-of*` is the element containing the binding attribute.

### Custom Elements

When implementing a custom element the coupling with custom commmands and a state can be achieved by instantiating a `Commander` and a `State`. The custom button element included in the library looks partly like this:

```javascript
class ButtonElement extends HTMLButtonElement {
  commander = new Commander(this)

  state

  constructor() {
    super()
    this.addEventListener('click', this.handleClick.bind(this))
  }

  connectedCallback() {
    this.state ??= State.setup(this)
    this.state?.register(this)
    this.commander.start()
    this.commander.execute('connected')
  }

  disconnectedCallback() {
    this.state?.unregister(this)
    this.commander.execute('disconnected')
    this.commander.stop()
  }

  stateChangedCallback(newValues, oldValues) {
    this.commander.executeState(newValues, oldValues)
  }

  handleClick(event) {
    this.commander.execute('click', {
      event,
    })
  }
}
```

In `connectedCallback` the element should set up the state once and register itself with it. It should also start the commander.

In `disconnectedCallback` the element should unregister itself from the state and stop the commander.

In general it is advised to move all behavioural code from custom elements to custom commands and use custom elements exclusively for structural purposes and event delegation.

### Discussion for WHATWG
