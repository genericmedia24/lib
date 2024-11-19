/* eslint-disable @typescript-eslint/no-floating-promises */

import { describe, it } from 'node:test'
import { formatDsvRows } from '../../src/helpers/format-dsv-rows.js'

describe('formatDsvRows', () => {
  it('should format rows', (test) => {
    test.assert.deepEqual(formatDsvRows([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]), 'a,b,c\nd,e,f\n')
  })
})
