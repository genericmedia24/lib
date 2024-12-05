import { describe, it } from 'node:test'
import { sql } from '../../src/util/sql-tag.js'

describe('sql', () => {
  it('should join array', (test) => {
    test.assert.equal(
      sql`SELECT ${[1, 2]}`,
      'SELECT 1,2',
    )
  })

  it('should stringify primitive', (test) => {
    test.assert.equal(
      sql`SELECT ${1n}`,
      'SELECT 1',
    )

    test.assert.equal(
      sql`SELECT ${true}`,
      'SELECT true',
    )

    test.assert.equal(
      sql`SELECT ${1}`,
      'SELECT 1',
    )

    test.assert.equal(
      sql`SELECT ${'1'}`,
      'SELECT 1',
    )

    test.assert.equal(
      sql`SELECT '${Symbol('1')}'`,
      'SELECT \'Symbol(1)\'',
    )
  })

  it('should default to empty string', (test) => {
    test.assert.equal(
      sql`SELECT ${{}}`,
      'SELECT',
    )
  })

  it('should trim final result', (test) => {
    test.assert.equal(
      sql` SELECT 1 `,
      'SELECT 1',
    )
  })
})
