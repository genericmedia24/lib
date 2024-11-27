/* eslint-disable @typescript-eslint/no-floating-promises */

import { Readable } from 'node:stream'
import { describe, it, type TestContext } from 'node:test'
import type { ParseDsvOptions } from '../../src/dsv/parse-options.js'
import { parseDsvStream } from '../../src/dsv/parse-stream.js'

async function testParseDsvStream(test: TestContext, chunks: string[], expected: string[][], options?: Partial<ParseDsvOptions>): Promise<void> {
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