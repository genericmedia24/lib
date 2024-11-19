/* eslint-disable @typescript-eslint/no-floating-promises */

import { describe, it } from 'node:test'
import { parseDsvRowToObject } from '../../src/helpers/parse-dsv-row-to-object.js'

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
