import { describe, it } from 'node:test'
import { html } from '../../src/util/html-tag.js'

describe('html', () => {
  it('should join array', (test) => {
    const string = html`<span>${[3, 4]}</span>`
    test.assert.equal(string, '<span>34</span>')
  })

  it('should stringify primitive', (test) => {
    const bigintString = html`<span>${1n}</span>`
    test.assert.equal(bigintString, '<span>1</span>')

    const booleanString = html`<span>${true}</span>`
    test.assert.equal(booleanString, '<span>true</span>')

    const numberString = html`<span>${1}</span>`
    test.assert.equal(numberString, '<span>1</span>')

    const stringString = html`<span>${'1'}</span>`
    test.assert.equal(stringString, '<span>1</span>')

    const symbolString = html`<span>${Symbol('1')}</span>`
    test.assert.equal(symbolString, '<span>Symbol(1)</span>')
  })

  it('should encode HTML entities', (test) => {
    const string = html`<span>${'&<>\'"'}</span>`
    test.assert.equal(string, '<span>&#38;&#60;&#62;&#39;&#34;</span>')
  })

  it('should not encode HTML entities in raw value', (test) => {
    const string = html`<span>${html.raw('&<>\'"')}</span>`
    test.assert.equal(string, '<span>&<>\'"</span>')
  })

  it('should default to empty string', (test) => {
    const string = html`<span>${{}}</span>`
    test.assert.equal(string, '<span></span>')
  })

  it('should trim final result', (test) => {
    const string = html` <span>1</span> `
    test.assert.equal(string, '<span>1</span>')
  })
})
