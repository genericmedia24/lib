/**
 * Inspired by
 *   https://github.com/NeXTs/Clusterize.js
 *   https://github.com/adazzle/react-data-grid
 */

import debounce from 'debounce'

export interface ScrollerOptions {
  /**
   * The callback function to render a body cell.
   *
   * @example
   * ```
   * (value, rowIndex, columnIndex) => {
   *   return `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}">${value}</div>`
   * }
   * ```
   *
   * @param value the value of the cell
   * @param rowIndex the row index of the cell
   * @param columnIndex the colum index of the cell
   */
  renderBodyCell?: (value: string, rowIndex: number, columnIndex: number) => string

  /**
   * The callback function to render a head cell.
   *
   * @example
   * ```
   * (value, rowIndex, columnIndex) => {
   *   return `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}">${value}</div>`
   * }
   * ```
   *
   * @param value the value of the cell
   * @param rowIndex the row index of the cell
   * @param columnIndex the colum index of the cell
   */
  renderHeadCell?: (value: string, rowIndex: number, columnIndex: number) => string
}

export interface ScrollerFilterOptions {
  /**
   * The search string.
   */
  input?: string

  /**
   * Whether the search string should be case sensitive.
   */
  matchCase?: boolean

  /**
   * Whether the search string should a regular expression.
   */
  regExp?: boolean
}

/**
 * Scrolls through a large amount of tabular data smoothly.
 *
 *  @example
 * ```javascript
 * const scroller = new Scroller(document.querySelector('.table'))
 *
 * scroller.start()
 * scroller.addHeadRow(['a', 'b', 'c'])
 * scroller.addBodyRow([1, 2, 3])
 * scroller.update()
 * ```
 */
export class Scroller {
  /**
   * All the blocks inside `bodyElement`.
   */
  public bodyBlocks: HTMLElement[] = []

  /**
   * The amount of rows in one block.
   */
  public bodyBlockSize = 9000

  /**
   * The body element.
   */
  public bodyElement: HTMLElement

  /**
   * The rows that should be rendered inside the body.
   */
  public bodyRows: string[][] = []

  /**
   * A temporary copy of `bodyRows`, used when filtering rows.
   */
  public bodyRowsCopy?: string[][]

  /**
   * The widhts of the columns.
   */
  public columnWidths: number[] = []

  /**
   * The dimensions of `element`.
   */
  public domRect?: DOMRect

  /**
   * The main element.
   */
  public element: HTMLElement

  /**
   * The head element.
   */
  public headElement?: HTMLElement

  /**
   * The rows that should be rendered inside the head.
   */
  public headRows: string[][] = []

  /**
   * The maximum number of rows that can be processed by the scroller.
   *
   * This constraint is determined by the maximum number of pixels a browser allows to be set to a dimensional style property of an element.
   */
  public numBodyRowsMax = 0

  /**
   * The number of rows that are visible inside the body.
   */
  public numBodyRowsVisible = 0

  /**
   * The number of columns that
   */
  public numColumns = 0

  /**
   * The callback function to render a body cell.
   */
  public renderBodyCell = (value: string, rowIndex: number, columnIndex: number): string => {
    return `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}">${value}</div>`
  }

  /**
   * The callback function to render a head cell.
   */
  public renderHeadCell = (value: string, rowIndex: number, columnIndex: number): string => {
    return `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}">${value}</div>`
  }

  /**
   * The resize observer to recalculate the dimensions of the rows and columns when the element is resized.
   */
  public resizeObserver: ResizeObserver

  /**
   * The height of individual rows in pixels.
   */
  public rowHeight = 0

  /**
   * The bound resize handler.
   */
  protected handleResizeBound = debounce(this.handleResize.bind(this), 500)

  /**
   * The bound scroll handler.
   */
  protected handleScrollBound = this.handleScroll.bind(this)

  /**
   * `columnWidths` as a space separated string of CSS pixel values, for example "50px 50px 50px".
   */
  public get gridTemplateColumns(): string {
    return this.columnWidths
      .map((mapColumnWidth) => {
        return `${mapColumnWidth}px`
      })
      .join(' ')
  }

  /**
   * Creates a scroller.
   *
   * `bodyElement` is determined as lastElementChild of `element`.
   *
   * `headElement` is determined as firstElementChild of `element`.
   *
   * If lastElementChild and firstElementChild are equal, `headElement` is undefined.
   *
   * @param element the element
   * @param options the options
   */
  public constructor(element: HTMLElement, options?: ScrollerOptions) {
    this.element = element
    this.renderBodyCell = options?.renderBodyCell ?? this.renderBodyCell
    this.renderHeadCell = options?.renderHeadCell ?? this.renderHeadCell

    this.bodyElement = this.element.lastElementChild instanceof HTMLElement
      ? this.element.lastElementChild
      : this.element

    this.headElement = (
      this.element.firstElementChild instanceof HTMLElement &&
      this.element.firstElementChild !== this.element.lastElementChild
    )
      ? this.element.firstElementChild
      : undefined

    this.resizeObserver = new ResizeObserver(this.handleResizeBound)
  }

  /**
   * Adds a row to `bodyRows`.
   *
   * Determines `numColumns` based on the length of the row.
   *
   * @param row the row
   */
  public addBodyRow(row: string[]): void {
    this.bodyRows.push(row)
    this.numColumns = row.length
  }

  /**
   * Adds a row to `headRows`.
   *
   * Determines `numColumns` based on the length of the row.
   *
   * @param row the row
   */
  public addHeadRow(row: string[]): void {
    this.headRows.push(row)
    this.numColumns = row.length
  }

  /**
   * Clears the scroller.
   *
   * Sets `bodyRows`, `columnWidths` and `headRows` to empty arrays and `bodyRowsCopy` to undefined.
   *
   * @example
   * ```javascript
   * const scroller = new Scroller(document.querySelector('.table'))
   *
   * scroller.addHeadRow(['a', 'b', 'c'])
   * scroller.addBodyRow([1, 2, 3])
   *
   * console.log(scroller.bodyRows.length === 1) // true
   * console.log(scroller.headRows.length === 1) // true
   *
   * scroller.clear()
   *
   * console.log(scroller.bodyRows.length === 0) // true
   * console.log(scroller.headRows.length === 0) // true
   * ```
   */
  public clear(): void {
    this.bodyRows = []
    this.bodyRowsCopy = undefined
    this.columnWidths = []
    this.headRows = []
  }

  /**
   * Filters `bodyRows`.
   *
   * Applies the properties of `options` object to individual cells and filters the rows accordingly.
   *
   * Sets a copy of the original `bodyRows` on `bodyRowsCopy`. Clears the copy if the input is undefined.
   *
   * @example
   * ```javascript
   * const scroller = new Scroller(document.querySelector('.table'))
   *
   * scroller.start()
   *
   * scroller.addBodyRow(['sun'])
   * scroller.addBodyRow(['moon'])
   * scroller.addBodyRow(['stars'])
   *
   * scroller.filter({
   *   input: 'moon',
   * })
   *
   * scroller.update()
   * ```
   *
   * @param options the options
   */
  public filter(options: ScrollerFilterOptions): void {
    if (options.input === undefined) {
      this.bodyRows = this.bodyRowsCopy ?? this.bodyRows
      this.bodyRowsCopy = undefined
    } else {
      this.bodyRowsCopy ??= this.bodyRows

      const bodyRows: string[][] = []

      if (options.regExp === true) {
        const regExpFlags = `gu${options.matchCase === true ? '' : 'i'}`
        const regExp = new RegExp(options.input, regExpFlags)

        for (let rowIndex = 0; rowIndex < this.bodyRowsCopy.length; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
            if (regExp.test(this.bodyRowsCopy[rowIndex]?.[columnIndex])) {
              bodyRows.push(this.bodyRowsCopy[rowIndex])
              break
            }
          }
        }
      } else if (options.matchCase === true) {
        for (let rowIndex = 0; rowIndex < this.bodyRowsCopy.length; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
            if (this.bodyRowsCopy[rowIndex]?.[columnIndex]?.includes(options.input)) {
              bodyRows.push(this.bodyRowsCopy[rowIndex])
              break
            }
          }
        }
      } else {
        const input = options.input.toLowerCase()

        for (let rowIndex = 0; rowIndex < this.bodyRowsCopy.length; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
            if (this.bodyRowsCopy[rowIndex]?.[columnIndex]?.toLowerCase().includes(input)) {
              bodyRows.push(this.bodyRowsCopy[rowIndex])
              break
            }
          }
        }
      }

      this.bodyRows = bodyRows
    }

    this.update()
  }

  /**
   * Resizes a column.
   *
   * Efficiently updates the styles of both the head and the body.
   *
   * @example
   * ```javascript
   * const scroller = new Scroller(document.querySelector('.table'))
   *
   * scroller.start()
   * scroller.addBodyRow(['sun', 'moon', 'stars'])
   * scroller.update()
   * scroller.resizeColumn(1, 300)
   * ```
   *
   * @param index the index of the column
   * @param width the new width of the column
   */
  public resizeColumn(index: number, width: 'auto' | number): void {
    this.columnWidths[index] = width === 'auto'
      ? this.calculateColumnWidth(index)
      : width

    this.updateHeadElementStyle()
    this.updateBodyBlocksStyle()
  }

  /**
   * Start the scroller.
   *
   * Calculates `rowHeight`, `numBodyRowsMax` and `numBodyRowsVisible`.
   *
   * Starts `resizeObserver` and starts listening for scroll events.
   */
  public start(): this {
    this.rowHeight = this.rowHeight === 0
      ? this.deterimineRowHeight()
      : this.rowHeight

    this.numBodyRowsMax = this.numBodyRowsMax === 0
      ? this.calculateNumBodyRowsMax()
      : this.numBodyRowsMax

    this.numBodyRowsVisible = this.numBodyRowsVisible === 0
      ? this.calculateNumBodyRowsVisible()
      : this.numBodyRowsVisible

    this.resizeObserver.observe(this.element)
    this.element.addEventListener('scroll', this.handleScrollBound)
    this.handleResize([])

    return this
  }

  /**
   * Stops the scroller.
   *
   * Stops `resizeObserver` and stops listening for scroll events.
   */
  public stop(): this {
    this.resizeObserver.unobserve(this.element)
    this.element.removeEventListener('scroll', this.handleScrollBound)

    return this
  }

  /**
   * Updates the styles of `element`, `bodyElement` and `headElement`.
   */
  public update(): void {
    this.createBodyBlocks()
    this.updateHeadElementInnerHtml()
    this.updateBodyElementInnerHtml()
    this.calculateColumnWidths()
    this.updateHeadElementStyle()
    this.updateBodyBlocksStyle()
    this.updateElementStyle()
  }

  /**
   * Calculates the column width.
   *
   * @param columnIndex the index of the column
   */
  protected calculateColumnWidth(columnIndex: number): number {
    let columnWidth = 0

    if (this.headElement !== undefined) {
      const tmpHeadElement = this.element.appendChild(this.headElement.cloneNode(true)) as HTMLElement

      tmpHeadElement.style.setProperty('position', 'absolute')
      tmpHeadElement.style.setProperty('grid-template-columns', `repeat(${this.numColumns}, max-content)`)
      columnWidth = this.calculateColumnWidthInElement(tmpHeadElement, columnIndex, columnWidth)
      tmpHeadElement.remove()
    }

    const bodyBlock = this.bodyBlocks.find((findBodyBlock) => {
      return findBodyBlock.childElementCount > 0
    })

    if (bodyBlock !== undefined) {
      const tmpBodyBlock = this.bodyElement.appendChild(bodyBlock.cloneNode(true)) as HTMLElement

      tmpBodyBlock.style.setProperty('position', 'absolute')
      tmpBodyBlock.style.setProperty('grid-template-columns', `repeat(${this.numColumns}, max-content)`)
      columnWidth = this.calculateColumnWidthInElement(tmpBodyBlock, columnIndex, columnWidth)
      tmpBodyBlock.remove()
    }

    return columnWidth
  }

  /**
   * Calculates the column width inside a specific element.
   *
   * @param element the element
   * @param columnIndex the index of the column
   * @param initialWidth the initial width of the column
   */
  protected calculateColumnWidthInElement(element: HTMLElement, columnIndex: number, initialWidth: number): number {
    let columnWidth = initialWidth

    for (let rowIndex = 0; rowIndex < element.childElementCount; rowIndex += 1) {
      columnWidth = Math.max(
        columnWidth,
        element.children
          .item(rowIndex)
          ?.children
          .item(columnIndex)
          ?.getBoundingClientRect().width ?? 0,
      )
    }

    return columnWidth
  }

  /**
   * Calculates all column widths. Sets `columnWidths` directly.
   */
  protected calculateColumnWidths(): void {
    if (this.columnWidths.length > 0) {
      return
    }

    const columnWidths = new Array(this.numColumns).fill(0) as number[]

    if (this.headElement !== undefined) {
      const tmpHeadElement = this.element.appendChild(this.headElement.cloneNode(true)) as HTMLElement

      tmpHeadElement.style.setProperty('position', 'absolute')
      tmpHeadElement.style.setProperty('grid-template-columns', `repeat(${this.numColumns}, max-content)`)

      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
        columnWidths[columnIndex] = this.calculateColumnWidthInElement(tmpHeadElement, columnIndex, columnWidths[columnIndex])
      }

      tmpHeadElement.remove()
    }

    const bodyBlock = this.bodyBlocks.find((findBodyBlock) => {
      return findBodyBlock.childElementCount > 0
    })

    if (bodyBlock !== undefined) {
      const tmpBodyBlock = this.bodyElement.appendChild(bodyBlock.cloneNode(true)) as HTMLElement

      tmpBodyBlock.style.setProperty('position', 'absolute')
      tmpBodyBlock.style.setProperty('grid-template-columns', `repeat(${this.numColumns}, max-content)`)

      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
        columnWidths[columnIndex] = this.calculateColumnWidthInElement(tmpBodyBlock, columnIndex, columnWidths[columnIndex])
      }

      tmpBodyBlock.remove()

      const gridTemplateColumns = columnWidths.map((mapColumnWidth) => {
        return mapColumnWidth < (128 * 3)
          ? `${mapColumnWidth}px`
          : `minmax(${128 * 3}px, 1fr)`
      }).join(' ')

      bodyBlock.style.setProperty('grid-template-columns', gridTemplateColumns)

      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
        columnWidths[columnIndex] = bodyBlock.children
          .item(0)
          ?.children
          .item(columnIndex)
          ?.getBoundingClientRect().width ?? 0
      }

      this.columnWidths = columnWidths
    }
  }

  /**
   * Calculates `numBodyRowsMax`.
   */
  protected calculateNumBodyRowsMax(): number {
    const maxHeight = this.findMaxHeight(1_000_000)
    const maxRows = Math.floor(maxHeight / this.rowHeight)
    const divisor = 10 ** (maxRows.toString().length - 1)

    return Math.floor(maxRows / divisor) * divisor
  }

  /**
   * Calculates `numBodyRowsVisible`.
   */
  protected calculateNumBodyRowsVisible(): number {
    return Math.ceil(this.element.offsetHeight / this.rowHeight)
  }

  /**
   * Creates the body blocks necessary to hold the rows.
   *
   * Clears `bodyElement` and then appends the blocks to it.
   */
  protected createBodyBlocks(): void {
    const numBlocks = Math.floor(this.bodyRows.length / this.bodyBlockSize)
    const lastBlockSize = this.bodyRows.length % this.bodyBlockSize

    this.bodyElement.innerHTML = ''

    this.bodyBlocks = new Array(numBlocks)
      .fill(this.bodyBlockSize)
      .concat(lastBlockSize === 0 ? [] : [lastBlockSize])
      .map((bodyBlockSize: number) => {
        const block = this.bodyElement.appendChild(document.createElement('div'))

        block.style.setProperty('height', `${bodyBlockSize * this.rowHeight}px`)
        block.style.setProperty('grid-template-columns', `repeat(${this.numColumns}, max-content)`)
        block.style.setProperty('grid-template-rows', `repeat(${bodyBlockSize}, ${this.rowHeight}px)`)

        return block
      })
  }

  /**
   * Determines `rowHeight`.
   */
  protected deterimineRowHeight(): number {
    const cell = this.bodyElement
      .appendChild(document.createElement('div'))
      .appendChild(document.createElement('div'))
      .appendChild(document.createElement('div'))

    const height = cell.offsetHeight

    cell.parentElement?.parentElement?.remove()

    return Math.max(32, height)
  }

  /**
   * Calculates the maximum height in pixels of an element that is allowed by the browser.
   *
   * @param expected the expected height
   */
  protected findMaxHeight(expected: number): number {
    const element = this.element.appendChild(document.createElement('div'))

    element.style.height = `${expected}px`

    const actual = element.getBoundingClientRect().height

    element.remove()

    if (actual < expected) {
      return actual
    }

    return this.findMaxHeight(expected * 10)
  }

  /**
   * Handles the resizing of `element`.
   *
   * Recalculates `numBodyRowsVisible` and `domRect`. Calls `update`.
   *
   * @param entries the resize entries
   */
  protected handleResize(entries: ResizeObserverEntry[]): void {
    if (
      this.domRect !== undefined && (
        this.domRect.height !== entries[0]?.contentRect.height ||
        this.domRect.width !== entries[0]?.contentRect.width
      )
    ) {
      this.numBodyRowsVisible = this.calculateNumBodyRowsVisible()
      this.columnWidths = []
      this.update()
    }

    this.domRect = this.element.getBoundingClientRect()
  }

  /**
   * Handles the scroll event.
   */
  protected handleScroll(): void {
    this.updateBodyElementInnerHtml()
  }

  /**
   * Updates the styles of `bodyBlocks`.
   */
  protected updateBodyBlocksStyle(): void {
    const { gridTemplateColumns } = this

    for (let blockIndex = 0; blockIndex < this.bodyBlocks.length; blockIndex += 1) {
      this.bodyBlocks[blockIndex]?.style.setProperty('grid-template-columns', gridTemplateColumns)
    }
  }

  /**
   * Updates the innerHTML of `bodyElement`.
   *
   * Renders the cells of all `bodyRows` and adds them to `bodyElement`.
   */
  protected updateBodyElementInnerHtml(): void {
    let columnIndexStart = 0
    let maxCols = 0

    const {
      offsetWidth,
      scrollLeft,
      scrollTop,
    } = this.element

    if (this.columnWidths.length === 0) {
      maxCols = this.numColumns
    } else {
      let columnLeft = 0
      let columnRight = 0

      for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
        columnRight = columnLeft + (this.columnWidths[columnIndex])

        if ((columnRight - scrollLeft) < 0) {
          columnIndexStart += 1
        }

        if ((columnLeft - scrollLeft) <= offsetWidth) {
          maxCols += 1
        }

        columnLeft = columnRight
      }
    }

    let blockIndex = 0
    let html = ''
    let rowIndex = Math.floor(scrollTop / this.rowHeight)
    let rowIndexInBlock = 0
    const blocks = new Array(this.bodyBlocks.length).fill('') as string[]
    const maxRows = Math.min(this.bodyRows.length, rowIndex + this.numBodyRowsVisible)

    for (; rowIndex < maxRows; rowIndex += 1) {
      blockIndex = Math.floor(rowIndex / this.bodyBlockSize)
      rowIndexInBlock = rowIndex % this.bodyBlockSize
      html += `<div data-index="${rowIndex}">`

      for (let columnIndex = columnIndexStart; columnIndex < maxCols; columnIndex += 1) {
        html += this.renderBodyCell(this.bodyRows[rowIndex]?.[columnIndex], rowIndexInBlock, columnIndex)
      }

      html += '</div>'

      if (rowIndexInBlock === (this.bodyBlockSize - 1)) {
        blocks[blockIndex] = html
        html = ''
      }
    }

    if ((rowIndex % this.bodyBlockSize) !== 0) {
      blocks[blockIndex] = html
    }

    for (blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
      (this.bodyBlocks[blockIndex]).innerHTML = blocks[blockIndex]
    }
  }

  /**
   * Updates the style of `element`.
   */
  protected updateElementStyle(): void {
    this.element.classList.toggle('maximized', this.bodyElement.offsetWidth === this.element.offsetWidth)
    this.element.classList.toggle('overflow-x', this.element.scrollWidth > this.element.offsetWidth)
    this.element.classList.toggle('overflow-y', this.element.scrollHeight > this.element.offsetHeight)
  }

  /**
   * Updates the innerHTML of `headElement`.
   *
   * Renders the cells of all `headRows` and adds them to `headElement`.
   */
  protected updateHeadElementInnerHtml(): void {
    if (this.headElement !== undefined) {
      let html = ''

      for (let rowIndex = 0; rowIndex < this.headRows.length; rowIndex += 1) {
        html += `<div data-index="${rowIndex}">`

        for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
          html += this.renderHeadCell(this.headRows[rowIndex]?.[columnIndex], rowIndex, columnIndex)
        }

        html += '</div>'
      }

      this.headElement.innerHTML = html
    }
  }

  /**
   * Updates the style of `headElement`.
   */
  protected updateHeadElementStyle(): void {
    this.headElement?.style.setProperty('grid-template-columns', this.gridTemplateColumns)
  }
}
