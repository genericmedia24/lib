import { describe, it } from 'node:test'
import { isNil } from '../../src/util/is-nil.js'

describe('isNil', () => {
  it('should return true for null', (test) => {
    test.assert.equal(isNil(null), true)
  })

  it('should return true for undefined', (test) => {
    test.assert.equal(isNil(undefined), true)
  })

  it('should return false for bigint', (test) => {
    test.assert.equal(isNil(1n), false)
  })

  it('should return false for boolean', (test) => {
    test.assert.equal(isNil(true), false)
  })

  it('should return false for number', (test) => {
    test.assert.equal(isNil(1), false)
  })

  it('should return false for string', (test) => {
    test.assert.equal(isNil('1'), false)
  })

  it('should return false for symbol', (test) => {
    test.assert.equal(isNil(Symbol('1')), false)
  })

  it('should return false for object', (test) => {
    test.assert.equal(isNil({}), false)
  })
})
