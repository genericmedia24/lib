/* eslint-disable @typescript-eslint/no-floating-promises */

import { Readable } from 'node:stream'
import { describe, it, type TestContext } from 'node:test'
import { formatCsvRow, formatCsvRows, parseCsvStream, parseCsvString, parseCsvWebStream } from '../../src/helpers/csv.js'

async function testParseCsvStream(test: TestContext, chunks: string[], expected: string[][]): Promise<void> {
  const stream = new Readable({
    read(): void {
      chunks.forEach((chunk) => {
        this.push(chunk)
      })

      this.push(null)
    },
  })

  const actual: string[][] = []

  await new Promise<void>((resolve) => {
    parseCsvStream(stream, (row) => {
      actual.push(row)
    }, () => {
      test.assert.deepEqual(actual, expected)
      resolve()
    })

    stream.read()
  })
}

async function testParseCsvStreamError(test: TestContext, error: Error): Promise<void> {
  const stream = new Readable({
    read(): void {
      throw error
    },
  })

  await new Promise<void>((resolve) => {
    parseCsvStream(stream, () => {}, (callbackError) => {
      test.assert.deepEqual(callbackError, error)
      resolve()
    })

    stream.read()
  })
}

async function testParseCsvWebStream(test: TestContext, chunks: string[], expected: string[][]): Promise<void> {
  const stream = new Readable({
    read(): void {
      chunks.forEach((chunk) => {
        this.push(chunk)
      })

      this.push(null)
    },
  })

  const actual: string[][] = []

  await new Promise<void>((resolve) => {
    parseCsvWebStream(Readable.toWeb(stream) as ReadableStream, (row) => {
      actual.push(row)
    }, () => {
      test.assert.deepEqual(actual, expected)
      resolve()
    })

    stream.read()
  })
}

async function testParseCsvWebStreamError(test: TestContext, error: Error): Promise<void> {
  const stream = new Readable({
    read(): void {
      throw error
    },
  })

  await new Promise<void>((resolve) => {
    parseCsvWebStream(Readable.toWeb(stream) as ReadableStream, () => {}, (callbackError) => {
      test.assert.deepEqual(callbackError, error)
      resolve()
    })

    stream.read()
  })
}

describe('formatCsvRow', () => {
  it('should format unquoted strings', (test) => {
    test.assert.deepEqual(formatCsvRow(['a', 'b', 'c']), 'a,b,c')
  })

  it('should format escaped comma', (test) => {
    test.assert.deepEqual(formatCsvRow(['a', 'b,', 'c']), 'a,"b,",c')
  })

  it('should format escaped LF', (test) => {
    test.assert.deepEqual(formatCsvRow(['a', 'b\n', 'c']), 'a,"b\n",c')
  })

  it('should format escaped quote', (test) => {
    test.assert.deepEqual(formatCsvRow(['a', 'b"', 'c']), 'a,"b""",c')
  })

  it('should format null', (test) => {
    test.assert.deepEqual(formatCsvRow([null]), 'NULL')
  })

  it('should format Date', (test) => {
    const date = new Date()
    test.assert.deepEqual(formatCsvRow([date]), date.toISOString())
  })

  it('should format Buffer', (test) => {
    const buffer = Buffer.from('abc')
    test.assert.deepEqual(formatCsvRow([buffer]), 'YWJj')
  })

  it('should format Uint8Array', (test) => {
    const array = new TextEncoder().encode('abc')
    test.assert.deepEqual(formatCsvRow([array]), 'abc')
  })

  it('should format primitives', (test) => {
    test.assert.deepEqual(formatCsvRow(['a', 1, true]), 'a,1,true')
  })
})

describe('formatCsvRows', () => {
  it('should format rows', (test) => {
    test.assert.deepEqual(formatCsvRows([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]), 'a,b,c\nd,e,f')
  })
})

describe('parseCsvStream', () => {
  it('should parse unquoted one chunk', async (test) => {
    await testParseCsvStream(test, [
      'a,b,c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted two chunks', async (test) => {
    await testParseCsvStream(test, [
      'a,b,c\n',
      'd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before column delimiter', async (test) => {
    await testParseCsvStream(test, [
      'a,b',
      ',c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split after column delimiter', async (test) => {
    await testParseCsvStream(test, [
      'a,b,',
      'c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before LF', async (test) => {
    await testParseCsvStream(test, [
      'a,b,c\nd,e,f',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted uneven columns', async (test) => {
    await testParseCsvStream(test, [
      'a,b,c\nd,e\ng,h,i\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseCsvStream(test, [
      'a,b,c\nd,e\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse unquoted chunks without EOF', async (test) => {
    await testParseCsvStream(test, [
      'a,b,c\n',
      'd,e,f',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted one chunk', async (test) => {
    await testParseCsvStream(test, [
      '"a","b","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted two chunks', async (test) => {
    await testParseCsvStream(test, [
      '"a","b","c"\n',
      '"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split inside quotes', async (test) => {
    await testParseCsvStream(test, [
      '"a","b',
      '","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

    await testParseCsvStream(test, [
      '"a","b","c"\n"d","',
      'e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before column delimiter', async (test) => {
    await testParseCsvStream(test, [
      '"a","b"',
      ',"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split after column delimiter', async (test) => {
    await testParseCsvStream(test, [
      '"a","b",',
      '"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before LF', async (test) => {
    await testParseCsvStream(test, [
      '"a","b","c"\n"d","e","f"',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted uneven columns', async (test) => {
    await testParseCsvStream(test, [
      '"a","b","c"\n"d","e"\n"g","h","i"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseCsvStream(test, [
      '"a","b","c"\n"d","e"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted whitespace around quotes', async (test) => {
    await testParseCsvStream(test, [
      '"a 1" ,b 2, "c 3"\n ',
      '"d 4" ,e 5, "f 6"\n',
    ], [
      ['a 1', 'b 2', 'c 3'],
      ['d 4', 'e 5', 'f 6'],
    ])
  })

  it('should parse quoted chunks without EOF', async (test) => {
    await testParseCsvStream(test, [
      '"a","b","c"\n',
      '"d","e","f"',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should callback with an error', async (test) => {
    await testParseCsvStreamError(test, new Error('Parse error'))
  })
})

describe('parseCsvString', () => {
  it('should parse unquoted multiple rows multiple columns', (test) => {
    test.assert.deepEqual(parseCsvString('a,b,c\nd,e,f\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted multiple rows one column', (test) => {
    test.assert.deepEqual(parseCsvString('a\nb\nc\n'), [
      ['a'],
      ['b'],
      ['c'],
    ])
  })

  it('should parse unquoted one row multiple columns', (test) => {
    test.assert.deepEqual(parseCsvString('a,b,c\n'), [
      ['a', 'b', 'c'],
    ])
  })

  it('should parse unquoted one row one column', (test) => {
    test.assert.deepEqual(parseCsvString('a\n'), [
      ['a'],
    ])
  })

  it('should parse unquoted without EOF', (test) => {
    test.assert.deepEqual(parseCsvString('a,b,c'), [
      ['a', 'b', 'c'],
    ])
  })

  it('should parse unquoted with CR', (test) => {
    test.assert.deepEqual(parseCsvString('a,b,c\r\nd,e,f\r\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

    test.assert.deepEqual(parseCsvString('a,b\r\nc\r\n'), [
      ['a', 'b'],
      ['c', ''],
    ])
  })

  it('should parse unquoted empty column', (test) => {
    test.assert.deepEqual(parseCsvString('a,,c\nd,,f\n'), [
      ['a', '', 'c'],
      ['d', '', 'f'],
    ])
  })

  it('should parse unquoted empty row', (test) => {
    test.assert.deepEqual(parseCsvString('a,b,c\n\nd,e,f\n'), [
      ['a', 'b', 'c'],
      ['', '', ''],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted uneven columns', (test) => {
    test.assert.deepEqual(parseCsvString('a,b,c\nd,e\ng,h,i\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    test.assert.deepEqual(parseCsvString('a,b,c\nd,e\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted multiple rows multiple columns', (test) => {
    test.assert.deepEqual(parseCsvString('"a","b","c"\n"d","e","f"\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted multiple rows one column', (test) => {
    test.assert.deepEqual(parseCsvString('"a"\n"b"\n"c"\n'), [
      ['a'],
      ['b'],
      ['c'],
    ])
  })

  it('should parse quoted one row multiple columns', (test) => {
    test.assert.deepEqual(parseCsvString('"a","b","c"\n'), [
      ['a', 'b', 'c'],
    ])
  })

  it('should parse quoted one row one column', (test) => {
    test.assert.deepEqual(parseCsvString('"a"\n'), [
      ['a'],
    ])
  })

  it('should parse quoted escaped quote', (test) => {
    test.assert.deepEqual(parseCsvString('a,"b""",c\n'), [
      ['a', 'b"', 'c'],
    ])
  })

  it('should parse quoted escaped LF', (test) => {
    test.assert.deepEqual(parseCsvString('a,"b\n",c\n'), [
      ['a', 'b\n', 'c'],
    ])
  })

  it('should parse quoted escaped comma', (test) => {
    test.assert.deepEqual(parseCsvString('a,"b,",c\n'), [
      ['a', 'b,', 'c'],
    ])
  })

  it('should parse quoted with CR', (test) => {
    test.assert.deepEqual(parseCsvString('"a","b","c"\r\n"d","e","f"\r\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted empty column', (test) => {
    test.assert.deepEqual(parseCsvString('"a","","c"\n"d","","f"\n'), [
      ['a', '', 'c'],
      ['d', '', 'f'],
    ])
  })

  it('should parse quoted empty row', (test) => {
    test.assert.deepEqual(parseCsvString('"a","b","c"\n\n"d","e","f"\n'), [
      ['a', 'b', 'c'],
      ['', '', ''],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted uneven columns', (test) => {
    test.assert.deepEqual(parseCsvString('"a","b","c"\n"d","e"\n"g","h","i"\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    test.assert.deepEqual(parseCsvString('"a","b","c"\n"d","e"\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted whitespace around quotes', (test) => {
    test.assert.deepEqual(parseCsvString('"a 1" ,b 2, "c 3"\n "d 4" ,e 5, "f 6"\n'), [
      ['a 1', 'b 2', 'c 3'],
      ['d 4', 'e 5', 'f 6'],
    ])
  })

  it('should parse mixed', (test) => {
    test.assert.deepEqual(parseCsvString('"a",b,c\n"d",e,f\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse mixed with CR', (test) => {
    test.assert.deepEqual(parseCsvString('"a",b,c\r\n"d",e,f\n'), [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })
})

describe('parseCsvWebStream', () => {
  it('should parse unquoted one chunk', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b,c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted two chunks', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b,c\n',
      'd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before column delimiter', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b',
      ',c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split after column delimiter', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b,',
      'c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before LF', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b,c\nd,e,f',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted uneven columns', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b,c\nd,e\ng,h,i\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseCsvWebStream(test, [
      'a,b,c\nd,e\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse unquoted chunks without EOF', async (test) => {
    await testParseCsvWebStream(test, [
      'a,b,c\n',
      'd,e,f',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted one chunk', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted two chunks', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b","c"\n',
      '"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split inside quotes', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b',
      '","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

    await testParseCsvWebStream(test, [
      '"a","b","c"\n"d","',
      'e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before column delimiter', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b"',
      ',"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split after column delimiter', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b",',
      '"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before LF', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b","c"\n"d","e","f"',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted uneven columns', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b","c"\n"d","e"\n"g","h","i"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseCsvWebStream(test, [
      '"a","b","c"\n"d","e"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted whitespace around quotes', async (test) => {
    await testParseCsvWebStream(test, [
      '"a 1" ,b 2, "c 3"\n ',
      '"d 4" ,e 5, "f 6"\n',
    ], [
      ['a 1', 'b 2', 'c 3'],
      ['d 4', 'e 5', 'f 6'],
    ])
  })

  it('should parse quoted chunks without EOF', async (test) => {
    await testParseCsvWebStream(test, [
      '"a","b","c"\n',
      '"d","e","f"',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should callback with an error', async (test) => {
    await testParseCsvWebStreamError(test, new Error('Parse error'))
  })
})
