import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { CustomError } from '../../src/util/custom-error.js'

describe('CustomError', () => {
  it('should not transform custom error', (test) => {
    const base = new CustomError('error')
    const error = CustomError.from(base)
    test.assert.equal(error, base)
  })

  it('should create custom error from AggregateError', (test) => {
    const base = new AggregateError([
      new Error('first-error'),
      new Error('second-error'),
    ], 'aggregate-error')

    const error = CustomError.from(base)
    test.assert.equal(error.message, 'first-error')
  })

  it('should create custom error from AggregateError without errors', (test) => {
    const base = new AggregateError([], 'aggregate-error')
    const error = CustomError.from(base)
    test.assert.equal(error.message, 'aggregate-error')
  })

  it('should create custom error from error', (test) => {
    const base = new Error('error')
    const error = CustomError.from(base)
    test.assert.equal(error.message, 'error')
  })

  it('should create custom error from DOMException', (test) => {
    const base = new DOMException('error')
    const error = CustomError.from(base)
    test.assert.equal(error.message, 'error')
  })

  it('should create custom error from ErrorEvent', (test) => {
    const base = new window.ErrorEvent('type', {
      message: 'error',
    })

    const error = CustomError.from(base)
    test.assert.equal(error.message, 'error')
  })

  it('should create custom error from string', (test) => {
    const error = CustomError.from('error')
    test.assert.equal(error.message, 'error')
  })

  it('should create default custom error', (test) => {
    const error = CustomError.from(null)
    test.assert.equal(error.message, 'An error occurred')
  })
})
