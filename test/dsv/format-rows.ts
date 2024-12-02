import { describe, it } from 'node:test'
import { formatDsvRows } from '../../src/dsv/format-rows.js'

describe('formatDsvRows', () => {
  it('should format rows', (test) => {
    test.assert.deepEqual(formatDsvRows([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]), 'a,b,c\nd,e,f\n')
  })
})
