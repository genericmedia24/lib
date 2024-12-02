import { describe, it } from 'node:test'
import { parseDsvString } from '../../src/dsv/parse-string.js'

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
