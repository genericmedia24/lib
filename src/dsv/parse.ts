/**
 * Inspired by
 *   https://github.com/leeoniya/uDSV
 *   https://github.com/d3/d3-dsv
 */

import type { ParseDsvOptions } from './parse-options.js'
import type { ParseDsvState } from './parse-state.js'

/**
 * Parses a DSV string incrementally.
 *
 * See [the guide](../../docs/guides/dsv.md) for more information.
 *
 * @param state the state
 * @param rowCallback the callback function
 * @param options the options
 */
export function parseDsv(state: ParseDsvState, rowCallback: (row: string[]) => void, options: ParseDsvOptions): void {
  const stringLength = state.string.length
  let start = 0
  let index = 0

  if (state.string.includes(options.enclosing)) {
    let code: string | undefined = undefined
    let end = 0
    let value: string | undefined = undefined
    let valueStart = 0

    state.columnIndex ??= 0
    state.row ??= []

    while (index < stringLength) {
      code = state.string[index]

      if (code === options.enclosing) {
        value = ''
        valueStart = index

        while (true) {
          index = state.string.indexOf(options.enclosing, index + 1)

          if (index === -1) {
            index = stringLength
            break
          }

          value += state.string.slice(valueStart + 1, index)

          if (state.string[index + 1] === options.enclosing) {
            valueStart = index
            index += 1
          } else {
            end = index
            index += 1
            break
          }
        }

        code = state.string[index]
      }

      if (
        code === options.delimiter ||
        code === '\n'
      ) {
        if (value === undefined) {
          state.row[state.columnIndex] = state.string[end - 1] === '\r'
            ? state.string.slice(start, end - 1)
            : state.string.slice(start, end)
        } else {
          state.row[state.columnIndex] = value
          value = undefined
        }

        state.columnIndex += 1

        if (code === '\n') {
          rowCallback(state.row)
          state.rowTemplate ??= new Array(state.row.length).fill('')
          state.row = state.rowTemplate.slice()
          state.columnIndex = 0
        }

        index += 1
        end = index
        start = end
      } else {
        index += 1
        end = index
      }
    }
  } else {
    let columnDelimiterIndex = 0
    let rowDelimiterIndex = state.string.indexOf('\n')

    state.columnIndex ??= 0

    state.rowTemplate ??= new Array(
      state.string
        .slice(0, rowDelimiterIndex)
        .split(options.delimiter)
        .length,
    ).fill('')

    state.row ??= state.rowTemplate.slice()

    const rowLength = state.rowTemplate.length - 1

    while (start < stringLength) {
      if (state.columnIndex === rowLength) {
        state.row[state.columnIndex] = state.string[rowDelimiterIndex - 1] === '\r'
          ? state.string.slice(start, rowDelimiterIndex - 1)
          : state.string.slice(start, rowDelimiterIndex)

        rowCallback(state.row)
        state.columnIndex = 0
        state.row = state.rowTemplate.slice()
        start = rowDelimiterIndex + 1
        rowDelimiterIndex = state.string.indexOf('\n', start)

        if (rowDelimiterIndex === -1) {
          break
        }
      } else {
        columnDelimiterIndex = state.string.indexOf(options.delimiter, start)

        if (
          columnDelimiterIndex === -1 ||
          columnDelimiterIndex > rowDelimiterIndex
        ) {
          state.row[state.columnIndex] = state.string[rowDelimiterIndex - 1] === '\r'
            ? state.string.slice(start, rowDelimiterIndex - 1)
            : state.string.slice(start, rowDelimiterIndex)

          rowCallback(state.row)
          state.columnIndex = 0
          state.row = state.rowTemplate.slice()
          start = rowDelimiterIndex + 1
          rowDelimiterIndex = state.string.indexOf('\n', start)

          if (rowDelimiterIndex === -1) {
            break
          }
        } else {
          state.row[state.columnIndex] = state.string.slice(start, columnDelimiterIndex)
          state.columnIndex += 1
          start = columnDelimiterIndex + 1
        }
      }
    }
  }

  if (start === stringLength) {
    state.string = ''
  } else {
    state.string = state.string.slice(start)
  }
}
