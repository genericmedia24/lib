import { describe, it } from 'node:test'
import { html } from '../../src/util/html-tag.js'

describe('html', () => {
  it('should join array', (test) => {
    test.assert.equal(
      html`<span>${[3, 4]}</span>`,
      '<span>34</span>',
    )
  })

  it('should stringify primitive', (test) => {
    test.assert.equal(
      html`<span>${1n}</span>`,
      '<span>1</span>',
    )

    test.assert.equal(
      html`<span>${true}</span>`,
      '<span>true</span>',
    )

    test.assert.equal(
      html`<span>${1}</span>`,
      '<span>1</span>',
    )

    test.assert.equal(
      html`<span>${'1'}</span>`,
      '<span>1</span>',
    )

    test.assert.equal(
      html`<span>${Symbol('1')}</span>`,
      '<span>Symbol(1)</span>',
    )
  })

  it('should encode HTML entities', (test) => {
    test.assert.equal(
      html`<span>${'&<>\'"'}</span>`,
      '<span>&#38;&#60;&#62;&#39;&#34;</span>',
    )
  })

  it('should not encode HTML entities in raw value', (test) => {
    test.assert.equal(
      html`<span>${html.raw('&<>\'"')}</span>`,
      '<span>&<>\'"</span>',
    )
  })

  it('should default to empty string', (test) => {
    test.assert.equal(
      html`<span>${{}}</span>`,
      '<span></span>',
    )
  })

  it('should trim final result', (test) => {
    test.assert.equal(
      html` <span>1</span> `,
      '<span>1</span>',
    )
  })
})
