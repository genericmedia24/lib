/**
 * Inspired by https://github.com/leeoniya/uDSV, https://github.com/d3/d3-dsv
 */

import type { Readable } from 'node:stream'
import type { Primitive } from 'type-fest'

export interface DsvOptions {
  delimiter: string
  enclosing: string
}

export interface DsvParseState {
  columnIndex?: number
  row?: string[]
  rowTemplate?: string[]
  string: string
}

const decoder = new TextDecoder()

export function formatDsvValue(value: Buffer | Date | Primitive | Uint8Array, options?: Partial<DsvOptions>): string {
  let result = ''

  if (typeof value === 'string') {
    const delimiter = options?.delimiter ?? ','
    const enclosing = options?.enclosing ?? '"'

    result = (
      value.includes(delimiter) ||
      value.includes(enclosing) ||
      value.includes('\n') ||
      value.includes('\r')
    )
      ? `${enclosing}${value.replaceAll(enclosing, `${enclosing}${enclosing}`)}${enclosing}`
      : value
  } else if (
    value === null ||
    value === undefined
  ) {
    result = 'NULL'
  } else if (value instanceof Date) {
    result = value.toISOString()
  } else if (value instanceof Uint8Array) {
    result = Buffer.isBuffer(value)
      ? value.toString('base64')
      : decoder.decode(value)
  } else {
    result = String(value)
  }

  return result
}

export function formatDsvRow(row: Array<Date | Primitive | Uint8Array>, options?: Partial<DsvOptions>): string {
  const result = new Array(row.length).fill('')

  for (let i = 0; i < row.length; i += 1) {
    result[i] = formatDsvValue(row[i], options)
  }

  return result.join(options?.delimiter ?? ',')
}

export function formatDsvRows(rows: Array<Array<Date | Primitive | Uint8Array>>, options?: Partial<DsvOptions>): string {
  const result = new Array(rows.length).fill('')

  for (let i = 0; i < rows.length; i += 1) {
    result[i] = formatDsvRow(rows[i] ?? [], options)
  }

  return result.join('\n')
}

export function parseDsv(state: DsvParseState, rowCallback: (row: string[]) => void, options: DsvOptions): void {
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

export function parseDsvRowToObject<ObjectType = Record<string, string>>(rowCallback: (object: ObjectType) => void): (row: string[]) => void {
  let toObject: ((row: string[]) => ObjectType) | undefined = undefined

  return (row): void => {
    if (toObject === undefined) {
      let objectBody = ''

      for (let i = 0; i < row.length; i += 1) {
        objectBody += `"${row[i] ?? ''}":row[${i}],`
      }

      // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
      toObject = new Function('row', `return {${objectBody}}`) as (row: string[]) => ObjectType
    } else {
      rowCallback(toObject(row))
    }
  }
}

export function parseDsvStream(stream: Readable, rowCallback: (row: string[]) => void, endCallback: (error?: unknown) => void, options?: Partial<DsvOptions>): Readable {
  const parseDsvOptions: DsvOptions = {
    delimiter: options?.delimiter ?? ',',
    enclosing: options?.enclosing ?? '"',
  }

  const parseDsvState: DsvParseState = {
    columnIndex: 0,
    row: [],
    string: '',
  }

  stream.on('data', (chunk: Buffer) => {
    parseDsvState.string += decoder.decode(chunk)

    if (parseDsvState.string.includes('\n')) {
      parseDsv(parseDsvState, rowCallback, parseDsvOptions)
    }
  })

  stream.on('error', endCallback)

  stream.on('end', () => {
    if (parseDsvState.string.length > 0) {
      if (!parseDsvState.string.endsWith('\n')) {
        parseDsvState.string = `${parseDsvState.string}\n`
      }

      parseDsv(parseDsvState, rowCallback, parseDsvOptions)
    }

    endCallback()
  })

  return stream
}

export function parseDsvString(string: string, rowCallback: (row: string[]) => void, options?: Partial<DsvOptions>): void {
  const parseDsvOptions: DsvOptions = {
    delimiter: options?.delimiter ?? ',',
    enclosing: options?.enclosing ?? '"',
  }

  const parseDsvState: DsvParseState = {
    columnIndex: 0,
    row: [],
    string: string.endsWith('\n')
      ? string
      : `${string}\n`,
  }

  parseDsv(parseDsvState, rowCallback, parseDsvOptions)
}

export function parseDsvWebStream(stream: ReadableStream, rowCallback: (row: string[]) => void, endCallback: (error?: unknown) => void, options?: Partial<DsvOptions>): ReadableStreamDefaultReader {
  const reader = stream.getReader()

  const parseDsvOptions: DsvOptions = {
    delimiter: options?.delimiter ?? ',',
    enclosing: options?.enclosing ?? '"',
  }

  const parseDsvState: DsvParseState = {
    columnIndex: 0,
    row: [],
    string: '',
  }

  const handleRead = ({ done, value }: ReadableStreamReadResult<Uint8Array>): void => {
    if (value !== undefined) {
      parseDsvState.string += decoder.decode(value)
    }

    if (done) {
      if (parseDsvState.string.length > 0) {
        if (!parseDsvState.string.endsWith('\n')) {
          parseDsvState.string = `${parseDsvState.string}\n`
        }

        parseDsv(parseDsvState, rowCallback, parseDsvOptions)
      }

      endCallback()
      return
    }

    parseDsv(parseDsvState, rowCallback, parseDsvOptions)

    reader
      .read()
      .then(handleRead)
      .catch(endCallback)
  }

  reader
    .read()
    .then(handleRead)
    .catch(endCallback)

  return reader
}
