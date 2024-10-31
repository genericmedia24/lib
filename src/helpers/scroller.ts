import debounce from 'debounce'

export interface ScrollerOptions {
  renderBodyCell?: (value: string, rowStart: number, columnStart: number) => string
  renderHeadCell?: (value: string, rowStart: number, columnStart: number) => string
}

export interface ScrollerFilterOptions {
  input?: string
  matchCase?: boolean
  regExp?: boolean
}

export class Scroller {
  public bodyBlocks: HTMLElement[] = []

  public bodyBlockSize = 9000

  public bodyElement: HTMLElement

  public bodyRows: string[][] = []

  public bodyRowsCopy?: string[][]

  public columnWidths: number[] = []

  public domRect?: DOMRect

  public element: HTMLElement

  public headElement?: HTMLElement

  public headRows: string[][] = []

  public numBodyRowsMax = 0

  public numBodyRowsVisible = 0

  public numColumns = 0

  public renderBodyCell?: (value: string, rowStart: number, columnStart: number) => string

  public renderHeadCell?: (value: string, rowStart: number, columnStart: number) => string

  public resizeObserver: ResizeObserver

  public rowHeight = 0

  protected handleResizeBound = debounce(this.handleResize.bind(this), 500)

  protected handleScrollBound = this.handleScroll.bind(this)

  public get gridTemplateColumns(): string {
    return this.columnWidths
      .map((mapColumnWidth) => {
        return `${mapColumnWidth}px`
      })
      .join(' ')
  }

  public constructor(element: HTMLElement, options?: ScrollerOptions) {
    this.element = element

    this.renderBodyCell = options?.renderBodyCell
    this.renderHeadCell = options?.renderHeadCell

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

  public addBodyRow(row: string[]): void {
    this.bodyRows.push(row)
    this.numColumns = row.length
  }

  public addHeadRow(row: string[]): void {
    this.headRows.push(row)
    this.numColumns = row.length
  }

  public clear(): void {
    this.bodyRows = []
    this.bodyRowsCopy = undefined
    this.columnWidths = []
    this.headRows = []
  }

  public filter(options: ScrollerFilterOptions): number {
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
            if (regExp.test(this.bodyRowsCopy[rowIndex]?.[columnIndex] ?? '')) {
              bodyRows.push(this.bodyRowsCopy[rowIndex] ?? [])
              break
            }
          }
        }
      } else if (options.matchCase === true) {
        for (let rowIndex = 0; rowIndex < this.bodyRowsCopy.length; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
            if (this.bodyRowsCopy[rowIndex]?.[columnIndex]?.includes(options.input) === true) {
              bodyRows.push(this.bodyRowsCopy[rowIndex] ?? [])
              break
            }
          }
        }
      } else {
        const input = options.input.toLowerCase()

        for (let rowIndex = 0; rowIndex < this.bodyRowsCopy.length; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
            if (this.bodyRowsCopy[rowIndex]?.[columnIndex]?.toLowerCase().includes(input) === true) {
              bodyRows.push(this.bodyRowsCopy[rowIndex] ?? [])
              break
            }
          }
        }
      }

      this.bodyRows = bodyRows
    }

    this.update()

    return this.bodyRows.length
  }

  public resizeColumn(index: number, width: 'auto' | number): void {
    this.columnWidths[index] = width === 'auto'
      ? this.calculateColumnWidth(index)
      : width

    this.updateHeadElementStyle()
    this.updateBodyBlocksStyle()
  }

  public start(): this {
    this.rowHeight = this.rowHeight === 0
      ? this.findRowHeight()
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

  public stop(): this {
    this.resizeObserver.unobserve(this.element)
    this.element.removeEventListener('scroll', this.handleScrollBound)

    return this
  }

  public update(): void {
    this.createBodyBlocks()
    this.updateHeadElement()
    this.updateBodyElement()
    this.calculateColumnWidths()
    this.updateHeadElementStyle()
    this.updateBodyBlocksStyle()
    this.updateElementStyle()
  }

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
        columnWidths[columnIndex] = this.calculateColumnWidthInElement(tmpHeadElement, columnIndex, columnWidths[columnIndex] ?? 0)
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
        columnWidths[columnIndex] = this.calculateColumnWidthInElement(tmpBodyBlock, columnIndex, columnWidths[columnIndex] ?? 0)
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

  protected calculateNumBodyRowsMax(): number {
    const maxTop = this.findMaxHeight(1_000_000)
    const maxValues = Math.floor(maxTop / this.rowHeight)
    const divisor = 10 ** (maxValues.toString().length - 1)
    return Math.floor(maxValues / divisor) * divisor
  }

  protected calculateNumBodyRowsVisible(): number {
    return Math.ceil(this.element.offsetHeight / this.rowHeight)
  }

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

  protected findRowHeight(): number {
    const cell = this.bodyElement
      .appendChild(document.createElement('div'))
      .appendChild(document.createElement('div'))
      .appendChild(document.createElement('div'))

    const height = cell.offsetHeight

    cell.parentElement?.parentElement?.remove()

    return Math.max(32, height)
  }

  protected handleResize(entries: ResizeObserverEntry[]): void {
    if (
      this.domRect?.height !== entries[0]?.contentRect.height ||
      this.domRect?.width !== entries[0]?.contentRect.width
    ) {
      this.numBodyRowsVisible = this.calculateNumBodyRowsVisible()
      this.columnWidths = []
      this.update()
    }

    this.domRect = this.element.getBoundingClientRect()
  }

  protected handleScroll(): void {
    this.updateBodyElement()
  }

  protected updateBodyBlocksStyle(): void {
    const { gridTemplateColumns } = this

    for (let blockIndex = 0; blockIndex < this.bodyBlocks.length; blockIndex += 1) {
      this.bodyBlocks[blockIndex]?.style.setProperty('grid-template-columns', gridTemplateColumns)
    }
  }

  protected updateBodyElement(): void {
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
        columnRight = columnLeft + (this.columnWidths[columnIndex] ?? 0)

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
        html += this.renderBodyCell?.(this.bodyRows[rowIndex]?.[columnIndex] ?? '', rowIndexInBlock + 1, columnIndex + 1) ?? `<div style="grid-area: ${rowIndexInBlock + 1}/${columnIndex + 1}">${this.bodyRows[rowIndex]?.[columnIndex] ?? ''}</div>`
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
      (this.bodyBlocks[blockIndex] as HTMLElement).innerHTML = blocks[blockIndex] ?? ''
    }
  }

  protected updateElementStyle(): void {
    this.element.classList.toggle('maximized', this.bodyElement.offsetWidth === this.element.offsetWidth)
    this.element.classList.toggle('overflow-x', this.element.scrollWidth > this.element.offsetWidth)
    this.element.classList.toggle('overflow-y', this.element.scrollHeight > this.element.offsetHeight)
  }

  protected updateHeadElement(): void {
    if (this.headElement !== undefined) {
      let html = ''

      for (let rowIndex = 0; rowIndex < this.headRows.length; rowIndex += 1) {
        html += `<div data-index="${rowIndex}">`

        for (let columnIndex = 0; columnIndex < this.numColumns; columnIndex += 1) {
          html += this.renderHeadCell?.(this.headRows[rowIndex]?.[columnIndex] ?? '', rowIndex + 1, columnIndex + 1) ?? `<div style="grid-area: ${rowIndex + 1}/${columnIndex + 1}">${this.headRows[rowIndex]?.[columnIndex] ?? ''}</div>`
        }

        html += '</div>'
      }

      this.headElement.innerHTML = html
    }
  }

  protected updateHeadElementStyle(): void {
    this.headElement?.style.setProperty('grid-template-columns', this.gridTemplateColumns)
  }
}
