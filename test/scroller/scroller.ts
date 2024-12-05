import 'global-jsdom/register'
import { describe, it } from 'node:test'
import ResizeObserver from 'resize-observer-polyfill'
import { defineElements } from '../../src/elements/define.js'
import { elements } from '../../src/elements/index.js'
import { Scroller } from '../../src/scroller/scroller.js'

describe('Scroller', () => {
  globalThis.ResizeObserver = ResizeObserver
  defineElements(elements)

  it('should start', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        return {
          height: 1_000_000,
        }
      }, {
        times: 2,
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      scroller.start()
      test.assert.equal(scroller.numBodyRowsMax, 30_000)
      test.assert.equal(scroller.numBodyRowsVisible, 19)
      test.assert.equal(scroller.rowHeight, 32)
    }
  })

  it('should restart', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        return {
          height: 1_000_000,
        }
      }, {
        times: 2,
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      test.assert.equal(scroller.numBodyRowsMax, 30_000)
      test.assert.equal(scroller.numBodyRowsVisible, 19)
      test.assert.equal(scroller.rowHeight, 32)
      scroller.stop()
      scroller.start()
      test.assert.equal(scroller.numBodyRowsMax, 30_000)
      test.assert.equal(scroller.numBodyRowsVisible, 19)
      test.assert.equal(scroller.rowHeight, 32)
    }
  })

  it('should set body and head elements', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      test.assert.equal(scroller.bodyElement, element.lastElementChild)
      test.assert.equal(scroller.headElement, element.firstElementChild)
    }
  })

  it('should set body element if scroller element has one child', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      test.assert.equal(scroller.bodyElement, element.firstElementChild)
      test.assert.equal(scroller.headElement, undefined)
    }
  })

  it('should set body element if scroller element has no children', (test) => {
    document.body.innerHTML = '<div></div>'

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      test.assert.equal(scroller.bodyElement, element)
      test.assert.equal(scroller.headElement, undefined)
    }
  })

  it('should add body rows and set num columns', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'b', 'c'])
      scroller.addBodyRow(['d', 'e', 'f'])
      test.assert.equal(scroller.bodyRows.length, 2)
      test.assert.equal(scroller.numColumns, 3)
    }
  })

  it('should add head rows and set num columns', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addHeadRow(['1', '2', '3'])
      test.assert.equal(scroller.headRows.length, 1)
      test.assert.equal(scroller.numColumns, 3)
    }
  })

  it('should filter body rows', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'b', 'c'])
      scroller.addBodyRow(['d', 'e', 'f'])
      test.assert.equal(scroller.bodyRows.length, 2)

      scroller.filter({
        input: 'b',
      })

      test.assert.equal(scroller.bodyRows.length, 1)
    }
  })

  it('should filter body rows with regular expression', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'b', 'c'])
      scroller.addBodyRow(['d', 'e', 'f'])
      test.assert.equal(scroller.bodyRows.length, 2)

      scroller.filter({
        input: '[abc]',
        regExp: true,
      })

      test.assert.equal(scroller.bodyRows.length, 1)
    }
  })

  it('should filter body rows with matching case', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'B', 'c'])
      scroller.addBodyRow(['a', 'b', 'c'])
      test.assert.equal(scroller.bodyRows.length, 2)

      scroller.filter({
        input: 'B',
        matchCase: true,
      })

      test.assert.equal(scroller.bodyRows.length, 1)
    }
  })

  it('should filter body rows with regular expression and matching case', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'B', 'c'])
      scroller.addBodyRow(['d', 'e', 'f'])
      test.assert.equal(scroller.bodyRows.length, 2)

      scroller.filter({
        input: '[ABC]',
        matchCase: true,
        regExp: true,
      })

      test.assert.equal(scroller.bodyRows.length, 1)
    }
  })

  it('should reset body rows with empty filter', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'b', 'c'])
      scroller.addBodyRow(['d', 'e', 'f'])
      test.assert.equal(scroller.bodyRows.length, 2)

      scroller.filter({
        input: undefined,
      })

      test.assert.equal(scroller.bodyRows.length, 2)

      scroller.filter({
        input: 'b',
      })

      test.assert.equal(scroller.bodyRows.length, 1)

      scroller.filter({
        input: undefined,
      })

      test.assert.equal(scroller.bodyRows.length, 2)
    }
  })

  it('should clear', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      scroller.addBodyRow(['a', 'b', 'c'])
      scroller.addBodyRow(['d', 'e', 'f'])
      scroller.addHeadRow(['1', '2', '3'])
      test.assert.equal(scroller.bodyRows.length, 2)
      test.assert.equal(scroller.headRows.length, 1)
      scroller.clear()
      test.assert.equal(scroller.bodyRows.length, 0)
      test.assert.equal(scroller.headRows.length, 0)
    }
  })

  it('should render', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        return {
          width: 200,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.addHeadRow(['1', '2', '3'])

      for (let i = 0; i < 10000; i += 1) {
        scroller.addBodyRow([`a${i}`, `b${i}`, `c${i}`])
      }

      scroller.update()
      test.assert.equal(scroller.bodyBlocks.length, 2)
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.headElement?.childElementCount, 1)
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('height'), '288000px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-rows'), 'repeat(9000, 32px)')
      test.assert.equal(scroller.bodyBlocks[0].childElementCount, 19)
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.textContent, 'a0')
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.getAttribute('style'), 'grid-area: 1/1')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('height'), '32000px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-rows'), 'repeat(1000, 32px)')
      test.assert.equal(scroller.bodyBlocks[1].childElementCount, 0)
    }
  })

  it('should render without rows', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        return {
          width: 200,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.update()
      test.assert.equal(scroller.bodyBlocks.length, 0)
      test.assert.equal(scroller.headElement?.childElementCount, 0)
    }
  })

  it('should render with custom renderers', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      function renderBodyCell(value: string, rowIndex: number, columnIndex: number): string {
        return `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}"><span>${value}</span></div>`
      }

      function renderHeadCell(value: string, rowIndex: number, columnIndex: number): string {
        return `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}"><span>${value}</span></div>`
      }

      const scroller = new Scroller(element, {
        renderBodyCell,
        renderHeadCell,
      })

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        return {
          width: 200,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.addHeadRow(['1', '2', '3'])

      for (let i = 0; i < 10000; i += 1) {
        scroller.addBodyRow([`a${i}`, `b${i}`, `c${i}`])
      }

      scroller.update()
      test.assert.equal(scroller.headElement?.firstElementChild?.firstElementChild?.firstElementChild?.nodeName, 'SPAN')
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.firstElementChild?.nodeName, 'SPAN')
    }
  })

  it('should default to minmax when column width exceeds threshold', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', function getBoundingClientRect(this: HTMLElement): Partial<DOMRect> {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        if (this.parentElement?.parentElement?.style.getPropertyValue('grid-template-columns').includes('minmax') === true) {
          return {
            width: 384,
          }
        }

        return {
          width: 400,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.addHeadRow(['1', '2', '3'])

      for (let i = 0; i < 10000; i += 1) {
        scroller.addBodyRow([`a${i}`, `b${i}`, `c${i}`])
      }

      scroller.update()
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '384px 384px 384px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '384px 384px 384px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '384px 384px 384px')
    }
  })

  it('should resize column', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        return {
          width: 200,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.addHeadRow(['1', '2', '3'])

      for (let i = 0; i < 10000; i += 1) {
        scroller.addBodyRow([`a${i}`, `b${i}`, `c${i}`])
      }

      scroller.update()
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      scroller.resizeColumn(1, 300)
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '200px 300px 200px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '200px 300px 200px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '200px 300px 200px')
      scroller.resizeColumn(1, 'auto')
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      scroller.update()
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
    }
  })

  it('should handle scroll down', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        return {
          width: 200,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.addHeadRow(['1', '2', '3'])

      for (let i = 0; i < 10000; i += 1) {
        scroller.addBodyRow([`a${i}`, `b${i}`, `c${i}`])
      }

      scroller.update()
      test.assert.equal(scroller.bodyBlocks.length, 2)
      test.assert.equal(scroller.headElement?.style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.headElement?.childElementCount, 1)
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('height'), '288000px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[0].style.getPropertyValue('grid-template-rows'), 'repeat(9000, 32px)')
      test.assert.equal(scroller.bodyBlocks[0].childElementCount, 19)
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.textContent, 'a0')
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.getAttribute('style'), 'grid-area: 1/1')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('height'), '32000px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-columns'), '200px 200px 200px')
      test.assert.equal(scroller.bodyBlocks[1].style.getPropertyValue('grid-template-rows'), 'repeat(1000, 32px)')
      test.assert.equal(scroller.bodyBlocks[1].childElementCount, 0)
      scroller.element.scrollTop = 288000 - 32
      scroller.element.dispatchEvent(new window.Event('scroll'))
      test.assert.equal(scroller.bodyBlocks[0].childElementCount, 1)
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.textContent, 'a8999')
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.getAttribute('style'), 'grid-area: 9000/1')
      test.assert.equal(scroller.bodyBlocks[1].childElementCount, 18)
      test.assert.equal(scroller.bodyBlocks[1].firstElementChild?.firstElementChild?.textContent, 'a9000')
      test.assert.equal(scroller.bodyBlocks[1].firstElementChild?.firstElementChild?.getAttribute('style'), 'grid-area: 1/1')
    }
  })

  it('should handle scroll right', (test) => {
    document.body.innerHTML = `
      <div>
        <div></div>
        <div></div>
      </div>
    `

    const element = document.querySelector('div')

    if (element !== null) {
      const scroller = new Scroller(element)

      const divElementGetBoundingClientRect = test.mock.method(HTMLDivElement.prototype, 'getBoundingClientRect', () => {
        if (divElementGetBoundingClientRect.mock.callCount() < 2) {
          return {
            height: 1_000_000,
          }
        }

        return {
          width: 200,
        }
      })

      test.mock.getter(element, 'offsetHeight', () => {
        return 600
      })

      test.mock.getter(element, 'offsetWidth', () => {
        return 200
      })

      scroller.start()
      scroller.addHeadRow(['1', '2', '3'])

      for (let i = 0; i < 10000; i += 1) {
        scroller.addBodyRow([`a${i}`, `b${i}`, `c${i}`])
      }

      scroller.update()
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.childElementCount, 3)
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.textContent, 'a0')
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.getAttribute('style'), 'grid-area: 1/1')
      scroller.element.scrollLeft = 300
      scroller.element.dispatchEvent(new window.Event('scroll'))
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.childElementCount, 2)
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.textContent, 'b0')
      test.assert.equal(scroller.bodyBlocks[0].firstElementChild?.firstElementChild?.getAttribute('style'), 'grid-area: 1/2')
    }
  })
})
