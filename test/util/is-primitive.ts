import { describe, it } from 'node:test'
import { isPrimitive } from '../../src/util/is-primitive.js'

describe('isPrimitive', () => {
  it('should return true for null', (test) => {
    test.assert.equal(isPrimitive(null), true)
  })

  it('should return true for undefined', (test) => {
    test.assert.equal(isPrimitive(undefined), true)
  })

  it('should return true for bigint', (test) => {
    test.assert.equal(isPrimitive(1n), true)
  })

  it('should return true for boolean', (test) => {
    test.assert.equal(isPrimitive(true), true)
  })

  it('should return true for number', (test) => {
    test.assert.equal(isPrimitive(1), true)
  })

  it('should return true for string', (test) => {
    test.assert.equal(isPrimitive('1'), true)
  })

  it('should return true for symbol', (test) => {
    test.assert.equal(isPrimitive(Symbol('1')), true)
  })

  it('should return false for object', (test) => {
    test.assert.equal(isPrimitive({}), false)
  })
})
