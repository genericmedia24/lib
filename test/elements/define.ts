import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { defineElements } from '../../src/elements/define.js'
import { ButtonElement, Element, elements } from '../../src/elements/index.js'

describe('define', () => {
  it('should define custom element that extends built-in element', (test) => {
    defineElements(elements)
    test.assert.equal(window.customElements.get('gm-button'), ButtonElement)
  })

  it('should define custom element that does not extend built-in element', (test) => {
    class CustomElement extends Element {}

    defineElements({
      CustomElement,
    })

    test.assert.equal(window.customElements.get('gm-custom'), CustomElement)
  })

  it('should define custom element with different prefix', (test) => {
    class CustomElement extends Element {}

    defineElements({
      CustomElement,
    }, 'test-')

    test.assert.equal(window.customElements.get('test-custom'), CustomElement)
  })
})
