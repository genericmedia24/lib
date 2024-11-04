/* eslint-disable @typescript-eslint/no-floating-promises */

import { Readable } from 'node:stream'
import { describe, it, type TestContext } from 'node:test'
import { type DsvOptions, formatDsvRow, formatDsvRows, parseDsvRowToObject, parseDsvStream, parseDsvString, parseDsvWebStream } from '../../src/helpers/dsv.js'

async function testParseDsvStream(test: TestContext, chunks: string[], expected: string[][], options?: Partial<DsvOptions>): Promise<void> {
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
    parseDsvStream(stream, (row) => {
      actual.push(row)
    }, () => {
      test.assert.deepEqual(actual, expected)
      resolve()
    }, options)

    stream.read()
  })
}

async function testParseDsvStreamError(test: TestContext, error: Error): Promise<void> {
  const stream = new Readable({
    read(): void {
      throw error
    },
  })

  await new Promise<void>((resolve) => {
    parseDsvStream(stream, () => {}, (callbackError) => {
      test.assert.deepEqual(callbackError, error)
      resolve()
    })

    stream.read()
  })
}

async function testParseDsvWebStream(test: TestContext, chunks: string[], expected: string[][], options?: Partial<DsvOptions>): Promise<void> {
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
    parseDsvWebStream(Readable.toWeb(stream) as ReadableStream, (row) => {
      actual.push(row)
    }, () => {
      test.assert.deepEqual(actual, expected)
      resolve()
    }, options)

    stream.read()
  })
}

async function testParseDsvWebStreamError(test: TestContext, error: Error): Promise<void> {
  const stream = new Readable({
    read(): void {
      throw error
    },
  })

  await new Promise<void>((resolve) => {
    parseDsvWebStream(Readable.toWeb(stream) as ReadableStream, () => {}, (callbackError) => {
      test.assert.deepEqual(callbackError, error)
      resolve()
    })

    stream.read()
  })
}

describe('formatDsvRow', () => {
  it('should format unquoted strings', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 'b', 'c']), 'a,b,c')
  })

  it('should format escaped comma', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 'b,', 'c']), 'a,"b,",c')
  })

  it('should format escaped LF', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 'b\n', 'c']), 'a,"b\n",c')
  })

  it('should format escaped quote', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 'b"', 'c']), 'a,"b""",c')
  })

  it('should format null', (test) => {
    test.assert.deepEqual(formatDsvRow([null]), 'NULL')
  })

  it('should format Date', (test) => {
    const date = new Date()
    test.assert.deepEqual(formatDsvRow([date]), date.toISOString())
  })

  it('should format Buffer', (test) => {
    const buffer = Buffer.from('abc')
    test.assert.deepEqual(formatDsvRow([buffer]), 'YWJj')
  })

  it('should format Uint8Array', (test) => {
    const array = new TextEncoder().encode('abc')
    test.assert.deepEqual(formatDsvRow([array]), 'abc')
  })

  it('should format primitives', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 1, true]), 'a,1,true')
  })

  it('should format delimiter', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 'b', 'c'], {
      delimiter: '\t',
    }), 'a\tb\tc')
  })

  it('should format enclosing', (test) => {
    test.assert.deepEqual(formatDsvRow(['a', 'b\n', 'c'], {
      enclosing: '$',
    }), 'a,$b\n$,c')
  })
})

describe('formatDsvRows', () => {
  it('should format rows', (test) => {
    test.assert.deepEqual(formatDsvRows([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]), 'a,b,c\nd,e,f')
  })
})

describe('parseDsvRowToObject', () => {
  it('should parse a row to an object', (test) => {
    const parse = parseDsvRowToObject((object) => {
      test.assert.deepEqual(object, {
        a: 'd',
        b: 'e',
        c: 'f',
      })
    })

    parse(['a', 'b', 'c'])
    parse(['d', 'e', 'f'])
  })
})

describe('parseDsvStream', () => {
  it('should parse unquoted one chunk', async (test) => {
    await testParseDsvStream(test, [
      'a,b,c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted two chunks', async (test) => {
    await testParseDsvStream(test, [
      'a,b,c\n',
      'd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before column delimiter', async (test) => {
    await testParseDsvStream(test, [
      'a,b',
      ',c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split after column delimiter', async (test) => {
    await testParseDsvStream(test, [
      'a,b,',
      'c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before LF', async (test) => {
    await testParseDsvStream(test, [
      'a,b,c\nd,e,f',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted uneven columns', async (test) => {
    await testParseDsvStream(test, [
      'a,b,c\nd,e\ng,h,i\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseDsvStream(test, [
      'a,b,c\nd,e\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse unquoted chunks without EOF', async (test) => {
    await testParseDsvStream(test, [
      'a,b,c\n',
      'd,e,f',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted one chunk', async (test) => {
    await testParseDsvStream(test, [
      '"a","b","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted two chunks', async (test) => {
    await testParseDsvStream(test, [
      '"a","b","c"\n',
      '"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split inside quotes', async (test) => {
    await testParseDsvStream(test, [
      '"a","b',
      '","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

    await testParseDsvStream(test, [
      '"a","b","c"\n"d","',
      'e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before column delimiter', async (test) => {
    await testParseDsvStream(test, [
      '"a","b"',
      ',"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split after column delimiter', async (test) => {
    await testParseDsvStream(test, [
      '"a","b",',
      '"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before LF', async (test) => {
    await testParseDsvStream(test, [
      '"a","b","c"\n"d","e","f"',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted uneven columns', async (test) => {
    await testParseDsvStream(test, [
      '"a","b","c"\n"d","e"\n"g","h","i"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseDsvStream(test, [
      '"a","b","c"\n"d","e"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted whitespace around quotes', async (test) => {
    await testParseDsvStream(test, [
      '"a 1" ,b 2, "c 3"\n ',
      '"d 4" ,e 5, "f 6"\n',
    ], [
      ['a 1', 'b 2', 'c 3'],
      ['d 4', 'e 5', 'f 6'],
    ])
  })

  it('should parse quoted chunks without EOF', async (test) => {
    await testParseDsvStream(test, [
      '"a","b","c"\n',
      '"d","e","f"',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse delimiter', async (test) => {
    await testParseDsvStream(test, [
      'a;b;c\nd;e;f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ], {
      delimiter: ';',
    })
  })

  it('should parse enclosing', async (test) => {
    await testParseDsvStream(test, [
      'a,$b$,c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ], {
      enclosing: '$',
    })
  })

  it('should callback with an error', async (test) => {
    await testParseDsvStreamError(test, new Error('Parse error'))
  })
})

describe('parseDsvString', () => {
  it('should parse unquoted multiple rows multiple columns', (test) => {
    const rows: string[][] = []

    parseDsvString('a,b,c\nd,e,f\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted multiple rows one column', (test) => {
    const rows: string[][] = []

    parseDsvString('a\nb\nc\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a'],
      ['b'],
      ['c'],
    ])
  })

  it('should parse unquoted one row multiple columns', (test) => {
    const rows: string[][] = []

    parseDsvString('a,b,c\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
    ])
  })

  it('should parse unquoted one row one column', (test) => {
    const rows: string[][] = []

    parseDsvString('a\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a'],
    ])
  })

  it('should parse unquoted without EOF', (test) => {
    const rows: string[][] = []

    parseDsvString('a,b,c', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
    ])
  })

  it('should parse unquoted with CR', (test) => {
    const rows: string[][] = []

    parseDsvString('a,b,c\r\nd,e,f\r\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

    rows.length = 0

    parseDsvString('a,b\r\nc\r\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b'],
      ['c', ''],
    ])
  })

  it('should parse unquoted empty column', (test) => {
    const rows: string[][] = []

    parseDsvString('a,,c\nd,,f\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', '', 'c'],
      ['d', '', 'f'],
    ])
  })

  it('should parse unquoted empty row', (test) => {
    const rows: string[][] = []

    parseDsvString('a,b,c\n\nd,e,f\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['', '', ''],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted uneven columns', (test) => {
    const rows: string[][] = []

    parseDsvString('a,b,c\nd,e\ng,h,i\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    rows.length = 0

    parseDsvString('a,b,c\nd,e\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted multiple rows multiple columns', (test) => {
    const rows: string[][] = []

    parseDsvString('"a","b","c"\n"d","e","f"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted multiple rows one column', (test) => {
    const rows: string[][] = []

    parseDsvString('"a"\n"b"\n"c"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a'],
      ['b'],
      ['c'],
    ])
  })

  it('should parse quoted one row multiple columns', (test) => {
    const rows: string[][] = []

    parseDsvString('"a","b","c"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
    ])
  })

  it('should parse quoted one row one column', (test) => {
    const rows: string[][] = []

    parseDsvString('"a"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a'],
    ])
  })

  it('should parse quoted escaped quote', (test) => {
    const rows: string[][] = []

    parseDsvString('a,"b""",c\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b"', 'c'],
    ])
  })

  it('should parse quoted escaped LF', (test) => {
    const rows: string[][] = []

    parseDsvString('a,"b\n",c\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b\n', 'c'],
    ])
  })

  it('should parse quoted escaped comma', (test) => {
    const rows: string[][] = []

    parseDsvString('a,"b,",c\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b,', 'c'],
    ])
  })

  it('should parse quoted with CR', (test) => {
    const rows: string[][] = []

    parseDsvString('"a","b","c"\r\n"d","e","f"\r\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted empty column', (test) => {
    const rows: string[][] = []

    parseDsvString('"a","","c"\n"d","","f"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', '', 'c'],
      ['d', '', 'f'],
    ])
  })

  it('should parse quoted empty row', (test) => {
    const rows: string[][] = []

    parseDsvString('"a","b","c"\n\n"d","e","f"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['', '', ''],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted uneven columns', (test) => {
    const rows: string[][] = []

    parseDsvString('"a","b","c"\n"d","e"\n"g","h","i"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    rows.length = 0

    parseDsvString('"a","b","c"\n"d","e"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted whitespace around quotes', (test) => {
    const rows: string[][] = []

    parseDsvString('"a 1" ,b 2, "c 3"\n "d 4" ,e 5, "f 6"\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a 1', 'b 2', 'c 3'],
      ['d 4', 'e 5', 'f 6'],
    ])
  })

  it('should parse mixed', (test) => {
    const rows: string[][] = []

    parseDsvString('"a",b,c\n"d",e,f\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse mixed with CR', (test) => {
    const rows: string[][] = []

    parseDsvString('"a",b,c\r\n"d",e,f\n', (row) => {
      rows.push(row)
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse delimiter', (test) => {
    const rows: string[][] = []

    parseDsvString('a;b;c\nd;e;f\n', (row) => {
      rows.push(row)
    }, {
      delimiter: ';',
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse enclosing', (test) => {
    const rows: string[][] = []

    parseDsvString('a,$b$,c\nd,e,f\n', (row) => {
      rows.push(row)
    }, {
      enclosing: '$',
    })

    test.assert.deepEqual(rows, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })
})

describe('parseDsvWebStream', () => {
  it('should parse unquoted one chunk', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b,c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted two chunks', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b,c\n',
      'd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before column delimiter', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b',
      ',c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split after column delimiter', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b,',
      'c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted chunks split before LF', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b,c\nd,e,f',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse unquoted uneven columns', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b,c\nd,e\ng,h,i\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseDsvWebStream(test, [
      'a,b,c\nd,e\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse unquoted chunks without EOF', async (test) => {
    await testParseDsvWebStream(test, [
      'a,b,c\n',
      'd,e,f',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted one chunk', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted two chunks', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b","c"\n',
      '"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split inside quotes', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b',
      '","c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

    await testParseDsvWebStream(test, [
      '"a","b","c"\n"d","',
      'e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before column delimiter', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b"',
      ',"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split after column delimiter', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b",',
      '"c"\n"d","e","f"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted chunks split before LF', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b","c"\n"d","e","f"',
      '\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse quoted uneven columns', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b","c"\n"d","e"\n"g","h","i"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
      ['g', 'h', 'i'],
    ])

    await testParseDsvWebStream(test, [
      '"a","b","c"\n"d","e"\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', ''],
    ])
  })

  it('should parse quoted whitespace around quotes', async (test) => {
    await testParseDsvWebStream(test, [
      '"a 1" ,b 2, "c 3"\n ',
      '"d 4" ,e 5, "f 6"\n',
    ], [
      ['a 1', 'b 2', 'c 3'],
      ['d 4', 'e 5', 'f 6'],
    ])
  })

  it('should parse quoted chunks without EOF', async (test) => {
    await testParseDsvWebStream(test, [
      '"a","b","c"\n',
      '"d","e","f"',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse partially quoted chunks without EOF', async (test) => {
    await testParseDsvWebStream(test, [
      'a,"b",c\n',
      'd,e,f',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('should parse delimiter', async (test) => {
    await testParseDsvWebStream(test, [
      'a;b;c\nd;e;f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ], {
      delimiter: ';',
    })
  })

  it('should parse enclosing', async (test) => {
    await testParseDsvWebStream(test, [
      'a,$b$,c\nd,e,f\n',
    ], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ], {
      enclosing: '$',
    })
  })

  it('should callback with an error', async (test) => {
    await testParseDsvWebStreamError(test, new Error('Parse error'))
  })
})
