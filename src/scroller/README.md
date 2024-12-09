# Scroller

## Problem description

To scroll through a large amount of tabular data in a browser, for example 100000 rows x 100 columns, built-in browser technology does not suffice. All the data has to be rendered at once to be able to scroll through it, but then browsers cannot handle the scrolling smoothly.

Many scroller libraries are available that solve this problem, but most have too many options and solve all kinds of other problems too. The criteria for a good scrolling library are:

1. Scrolls smoothly with a maximum amount of data;
2. Leverages native browser scrolling technology;
3. Has a simple API, that is: it should just support scrolling;
4. Is available in vanilla JavaScript.

## Existing solutions

[Clusterize.js](https://github.com/NeXTs/Clusterize.js) seems a good candidate on all criteria. It removes invisble rows from and puts visible rows into a predefined set of blocks that span the scrollable area. But when used with many columns and with real data the performance degrades quickly, because it applies its solution only to rows and not to columns.

[React-data-grid](https://github.com/adazzle/react-data-grid) uses CSS grid technology to achieve very fast repaints by avoiding reflows. It also applies virtual scrolling to both rows and columns, but it doesn't use blocks like clusterize.js to allow more than 10000 rows, which is the hard limit of the CSS grid repeat count. Besides that, it is only avaible as a React component.

## New solution

This library contains a scroller that combines the strong points of both packages to achieve smooth & simple, native & vanilla scrolling.

Detailed documentation can be found in the source code. See a [live version](https://genericmedia24.github.io/lib/scroller.html) of the code below.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Scroller</title>
    <script type="module">
      import { Scroller } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm"

      const scroller = new Scroller(document.querySelector(".table"))

      const numColumns = 100
      const numRows = 100000
      const string = crypto.randomUUID()

      scroller.start()

      scroller.addHeadRow(
        new Array(numColumns).fill("").map(() => {
          return string.slice(0, Math.round(Math.random() * 32))
        }),
      )

      for (let i = 0; i < numRows; i += 1) {
        scroller.addBodyRow(
          new Array(numColumns).fill("").map(() => {
            return string.slice(0, Math.round(Math.random() * 32))
          }),
        )
      }

      scroller.update()
    </script>
    <style>
      body {
        margin: 0;
      }

      .table {
        width: 100vw;
        height: 100vh;
        overflow: auto;

        & > .body {
          width: fit-content;

          & > div {
            display: grid;

            & > div {
              display: contents;

              & > div {
                display: flex;
                align-items: center;
                height: 2rem;
                padding-inline: 0.5rem;
                overflow: hidden;
                white-space: nowrap;
                border-block-end: 1px solid #eee;
                border-inline-end: 1px solid #eee;
              }

              &:hover {
                & > div {
                  cursor: pointer;
                  background-color: #eee;
                }
              }
            }
          }
        }

        & > .head {
          position: sticky;
          top: 0;
          z-index: 1;
          display: grid;

          & > div {
            display: contents;

            & > div {
              position: relative;
              display: flex;
              gap: 0.25rem;
              align-items: center;
              height: 2rem;
              padding-inline: 0.5rem;
              overflow: hidden;
              text-transform: uppercase;
              white-space: nowrap;
              background-color: #eee;
              border-block-end: 1px solid #eee;
              border-inline-end: 1px solid #eee;
            }
          }
        }

        &.maximized,
        &.overflow-x {
          & > .body {
            & > div {
              & > div {
                & > div {
                  &:last-child {
                    border-inline-end: none;
                  }
                }
              }
            }
          }

          & > .head {
            & > div {
              & > div {
                &:last-child {
                  border-inline-end: none;
                }
              }
            }
          }
        }
      }
    </style>
  </head>

  <body>
    <div class="table">
      <div class="head"></div>
      <div class="body"></div>
    </div>
  </body>
</html>
```

### Filter

It is possible to filter the body rows by calling `filter`.

```javascript
import { Scroller } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm"

const scroller = new Scroller(document.querySelector(".table"))

scroller.start()
scroller.addBodyRow(["sun"])
scroller.addBodyRow(["moon"])
scroller.addBodyRow(["stars"])

scroller.filter({
  input: "moon",
})

scroller.update()

console.log(scroller.bodyRows.length === 1) // true
```

### Resize

It is possible to resize a column by calling `resizeColumn`.

```javascript
import { Scroller } from "https://cdn.jsdelivr.net/npm/@genericmedia/lib/+esm"

const scroller = new Scroller(document.querySelector(".table"))

scroller.start()
scroller.addBodyRow(["sun", "moon", "stars"])
scroller.update()
scroller.resizeColumn(1, 300)
```
