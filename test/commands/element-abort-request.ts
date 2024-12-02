import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { ElementAbortRequestCommand } from '../../src/commands/element-abort-request.js'
import { defineElements } from '../../src/elements/define.js'
import { Element } from '../../src/elements/index.js'
import { Requester } from '../../src/requester/requester.js'

describe('ElementAbortRequest', () => {
  class CustomElement extends Element {
    public requester = new Requester(this)
  }

  defineElements({
    CustomElement,
  })

  const agent = new MockAgent()
  setGlobalDispatcher(agent)

  it('should abort request', (test) => {
    document.body.innerHTML = '<gm-custom></gm-custom>'

    const customElement = document.querySelector<CustomElement>('gm-custom')

    if (customElement !== null) {
      agent
        .get('https://example.com')
        .intercept({
          method: 'GET',
          path: '/',
        })
        .reply(200)

      const command = new ElementAbortRequestCommand(customElement, customElement)

      customElement.requester.fetch('https://example.com')
      command.execute()

      test.assert.equal(customElement.requester.abortController?.signal.aborted, true)
    }
  })
})
