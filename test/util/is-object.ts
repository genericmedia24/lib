import { describe, it } from 'node:test'
import { isObject } from '../../src/util/is-object.js'

describe('isObject', () => {
  it('should return true for object', (test) => {
    test.assert.equal(isObject({}), true)
  })

  it('should return false for null', (test) => {
    test.assert.equal(isObject(null), false)
  })

  it('should return false for array', (test) => {
    test.assert.equal(isObject([]), false)
  })

  it('should return false for primitive', (test) => {
    test.assert.equal(isObject(1), false)
  })

  it('should perform custom check', (test) => {
    test.assert.equal(isObject({ a: 1 }, (value) => {
      return value.a === 1
    }), true)

    test.assert.equal(isObject({ a: 1 }, (value) => {
      return value.a === 2
    }), false)
  })
})
