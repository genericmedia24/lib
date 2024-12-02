import { describe, it } from 'node:test'
import { formatDsvRow } from '../../src/dsv/format-row.js'

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
