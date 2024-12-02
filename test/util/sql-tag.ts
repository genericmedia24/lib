import { describe, it } from 'node:test'
import { sql } from '../../src/util/sql-tag.js'

describe('sql', () => {
  it('should join array', (test) => {
    const string = sql`SELECT ${[1, 2]}`
    test.assert.equal(string, 'SELECT 1,2')
  })

  it('should stringify primitive', (test) => {
    const bigintString = sql`SELECT ${1n}`
    test.assert.equal(bigintString, 'SELECT 1')

    const booleanString = sql`SELECT ${true}`
    test.assert.equal(booleanString, 'SELECT true')

    const numberString = sql`SELECT ${1}`
    test.assert.equal(numberString, 'SELECT 1')

    const stringString = sql`SELECT ${'1'}`
    test.assert.equal(stringString, 'SELECT 1')

    const symbolString = sql`SELECT '${Symbol('1')}'`
    test.assert.equal(symbolString, 'SELECT \'Symbol(1)\'')
  })

  it('should default to empty string', (test) => {
    const string = sql`SELECT ${{}}`
    test.assert.equal(string, 'SELECT')
  })

  it('should trim final result', (test) => {
    const string = sql` SELECT 1 `
    test.assert.equal(string, 'SELECT 1')
  })
})
