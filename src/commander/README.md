# Commander

## Problem description

User-facing applications generally consist of structure, styling and behaviour. In the world of web applications these architectural components are built with three different languages: HTML, CSS and JavaScript.

In order to work together as an application these languages need to be coupled. Every language serves its own purpose and as such has its own strengths and weaknesses. HTML consists of tags and attributes. JavaScript consists of functions which transform arguments as inputs into outputs.

The problem is that tags and attributes in the structural realm are naturally non-referential to the functions and arguments in the behaviour realm. Therefore a new artifact has to be designed to interpret attributes as references to functions.

An intermediary role is played by the DOM. Tags and attributes are translated into an object model, which serves as the basis for the functions to have access to the structure of the application.

An additional problem is that HTML is deliberately limited both in syntax and semantics: only a specified set of tags and attributes is actually considered meaningful and translated into the object model. On the other hand JavaScript functions and arguments provide for an infinite design space, only limited by the imagination of the programmer.

The main question is: how can structure and behaviour be coupled expressively, efficiently and securely?

Expressively means that the invocation from the structural realm should ideally map to the entire design space in the behavioural realm. A limited set of attributes should be able to invoke every specified function with any amount of arguments.

Efficiently means that ideally very little syntax should be introduced in order to make the interpretative artifact do its work and consequently that the amount of overhead in the structural code that needs to written to invoke behavioural code should be kept to a minimum.

Securely means that the artifact that is responsible for interpreting attributes as functions should only be allowed to invoke behaviour that is specified by the application. (That means expressive freedom but interpretative strictness.)

## Existing solutions

### HTML

HTML has the possibility to embed CSS and JavaScript through attributes, for example:

```html
<button onclick="doSomething()">click</button>
```

Because meaning depends on context, this may be benificial in cases where the amount of CSS and JavaScript is limited.

But because every language has its own syntax and semantics the combination of languages in one document is detrimental to readability when the amount of CSS and JavaScript needed for styling and behaviour increases.

Embedded JavaScript has also been the source of many security problems because event handler attributes allow for any JavaScript to be executed instead of only a predefined set of functions. Meta-syntax like CSP has been designed to solve these problems. It would be better to take away the source of the problems, consequently reducing the amount of meta-syntax.

### JavaScript

In JavaScript it is possible to listen for events triggered by elements in the application, for example:

```javascript
document.querySelector("button")?.addEventListener("click", () => {
  doSomething()
})
```

In the case of a few links between structure and behaviour (i.e. elements and event handlers) this may suffice. But in larger applications this way of coupling it too loose.

It is not obvious from reading the structural code which behaviour is involved in the functioning of the application. And from reading the behavioural code is not obvious in which structural context events are handled.

### Hybrids

The drawbacks of both approaches have led many people to design new syntaxes for coupling structure and behaviour.

React is a JavaScript-first approach with syntactic innovations in both JavaScript and HTML to ensure the coupling between both.

AngularJS took an HTML-first approach using special attributes to bind controllers to elements. Nowadays, Angular is a JavaScript-first approach with the Component as the primary construct to organise code.

Htmx is one of the latest additions to the collection of hybrid solutions. It is an HTML-first approach with special attributes to trigger limited predefined behaviour without the need to write JavaScript. In some cases JavaScript can be added to break free from the boundaries of the predefined behaviour.

The drawbacks of hybrids are manifold. One needs to learn a great deal of new syntax in order to develop an application. One needs to include framework code in order to make the application function. One needs transpilers in order to untangle hybrid language features into native language features.

It would be better to develop a solution that introduces (almost) no new syntax, provides for reading structural code with an understanding of the coupled behaviour, while allowing the code of the various languages to be written in files of their respective media (MIME) types.

## New solution

Enter Custom Commands, the long-lost pal of Custom Elements.

Detailed documentation can be found in the source code. See a [live version](https://genericmedia24.github.io/lib/commander.html) of the code below. A [more comprehensive example](https://genericmedia24.github.io/lib/app/index.html) is available too.

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
      } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm"

      class ElementSetBackgroundCommand extends Command {
        execute() {
          this.targetElement.style.backgroundColor = this.options.color
        }
      }

      window.customCommands = CommandRegistry.create()
      window.customCommands.define("element-set-background", ElementSetBackgroundCommand)

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

### Explanation

First, an event attribute is added to the button:

```html
data-onclick="element-set-background@message?color=royalblue"
```

The value of the attribute is an URI. The part before the @ is the name of the command. The part after the @ is the ID of the target element of the command. The part after the ? contains the options of the command.

The command is added to the registry with:

```javascript
window.customCommands.define("element-set-background", ElementSetBackgroundCommand)
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

The command is invoked by a commander. The commander is a property of all the custom elements defined in the library. For more information see the elaboration below.

The type of the custom element is defined by the `is` attribute of the button:

```html
is="gm-button"
```

This custom button element is part of the library and defined by calling a helper function:

```javascript
defineElements(elements)
```

### Elaboration

The specification of the custom button element looks partly like this:

```javascript
class ButtonElement extends HTMLButtonElement {
  commander = new Commander(this)

  constructor() {
    super()
    this.addEventListener("click", this.handleClick.bind(this))
  }

  handleClick(event) {
    this.commander.execute("click", {
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

### Inversion

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

A commander can be used alongside a [state](../state/README.md) in a custom element. The custom button element included in the library looks partly like this:

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
