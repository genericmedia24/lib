import { describe, it } from 'node:test'
import { isArray } from '../../src/util/is-array.js'

describe('isArray', () => {
  it('should return true for array', (test) => {
    test.assert.equal(isArray([]), true)
  })

  it('should return false for primitive', (test) => {
    test.assert.equal(isArray(1), false)
  })

  it('should perform custom check', (test) => {
    test.assert.equal(isArray([1], (value) => {
      return value[0] === 1
    }), true)

    test.assert.equal(isArray([1], (value) => {
      return value[0] === 2
    }), false)
  })
})
