# Requester

A thin wrapper around `fetch`. When an element is passed to the constructur, feedback about the request will be given on the element.

Detailed documentation can be found in the source code. See a [live version](https://genericmedia24.github.io/lib/requester.html) of the code below.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta
      name="viewport"
      content="width=device-width"
    >
    <title>Requester</title>
    <script type="module">
      // prettier-ignore
      import {
        Requester,
        elements,
        defineElements
      } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm"

      defineElements(elements)

      const element = document.body.querySelector("div")
      const requester = new Requester(element)
      const result = await requester.fetchJson("https://cdn.jsdelivr.net/npm/@genericmedia/lib/package.json")

      element.setHTMLUnsafe(result.version)
    </script>
    <style>
      [data-loading] {
        background: royalblue;
      }
    </style>
  </head>

  <body>
    <div
      data-loading-timeout="0"
      is="gm-div"
    >
      loading...
    </div>
  </body>
</html>
```
