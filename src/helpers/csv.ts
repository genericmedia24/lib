import type { Readable } from 'node:stream'
import type { Primitive } from 'type-fest'

export interface CsvParseState {
  columnIndex: number
  row: string[]
  rowTemplate?: string[]
  string: string
}

const decoder = new TextDecoder()

export function formatCsvValue(value: Buffer | Date | Primitive | Uint8Array): string {
  let result = ''

  if (typeof value === 'string') {
    result = /[",\r\n]/u.test(value)
      ? `"${value.replaceAll('"', '""')}"`
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

export function formatCsvRow(row: Array<Date | Primitive | Uint8Array>): string {
  const result = new Array(row.length).fill('')

  for (let i = 0; i < row.length; i += 1) {
    result[i] = formatCsvValue(row[i])
  }

  return result.join(',')
}

export function formatCsvRows(rows: Array<Array<Date | Primitive | Uint8Array>>): string {
  const result = new Array(rows.length).fill('')

  for (let i = 0; i < rows.length; i += 1) {
    result[i] = formatCsvRow(rows[i] ?? [])
  }

  return result.join('\n')
}

export function parseCsv(state: CsvParseState, rowCallback: (row: string[]) => void): void {
  const stringLength = state.string.length

  let start = 0
  let index = 0

  if (state.string.includes('"')) {
    let code: string | undefined = undefined
    let end = 0
    let value: string | undefined = undefined
    let valueStart = 0

    while (index < stringLength) {
      code = state.string[index]

      if (code === '"') {
        value = ''
        valueStart = index

        while (true) {
          index = state.string.indexOf('"', index + 1)

          if (index === -1) {
            index = stringLength
            break
          }

          value += state.string.slice(valueStart + 1, index)

          if (state.string[index + 1] === '"') {
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
        code === ',' ||
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
          state.row = state.rowTemplate.slice(0)
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

    state.rowTemplate ??= new Array(
      state.string
        .slice(0, rowDelimiterIndex)
        .split(',')
        .length,
    ).fill('')

    state.row = state.rowTemplate.slice()

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
        columnDelimiterIndex = state.string.indexOf(',', start)

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

export function parseCsvStream(stream: Readable, rowCallback: (row: string[]) => void, endCallback: (error?: unknown) => void): Readable {
  const state: CsvParseState = {
    columnIndex: 0,
    row: [],
    string: '',
  }

  stream.on('data', (chunk: Buffer) => {
    state.string += decoder.decode(chunk)

    if (state.string.includes('\n')) {
      parseCsv(state, rowCallback)
    }
  })

  stream.on('error', endCallback)

  stream.on('end', () => {
    if (state.string.length > 0) {
      if (!state.string.endsWith('\n')) {
        state.string = `${state.string}\n`
      }

      parseCsv(state, rowCallback)
    }

    endCallback()
  })

  return stream
}

export function parseCsvString(string: string): string[][] {
  const rows: string[][] = []

  const state = {
    columnIndex: 0,
    row: [],
    string: string.endsWith('\n')
      ? string
      : `${string}\n`,
  }

  parseCsv(state, (row) => {
    rows.push(row)
  })

  return rows
}

export function parseCsvWebStream(stream: ReadableStream, rowCallback: (row: string[]) => void, endCallback: (error?: unknown) => void): ReadableStreamDefaultReader {
  const reader = stream.getReader()

  const state: CsvParseState = {
    columnIndex: 0,
    row: [],
    string: '',
  }

  const handleRead = ({ done, value }: ReadableStreamReadResult<Uint8Array>): void => {
    if (value !== undefined) {
      state.string += decoder.decode(value)
    }

    if (done) {
      if (state.string.length > 0) {
        if (!state.string.endsWith('\n')) {
          state.string = `${state.string}\n`
        }

        parseCsv(state, rowCallback)
      }

      endCallback()
      return
    }

    parseCsv(state, rowCallback)

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
