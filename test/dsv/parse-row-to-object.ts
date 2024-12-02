import { describe, it } from 'node:test'
import { parseDsvRowToObject } from '../../src/dsv/parse-row-to-object.js'

describe('parseDsvRowToObject', () => {
  it('should parse row to object', (test) => {
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
