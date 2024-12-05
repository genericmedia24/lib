import 'global-jsdom/register'
import Cookies from 'js-cookie'
import { describe, it } from 'node:test'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { defineElements } from '../../src/elements/define.js'
import { DivElement } from '../../src/elements/div.js'
import { elements } from '../../src/elements/index.js'
import { Requester } from '../../src/requester/requester.js'
import { CustomError } from '../../src/util/custom-error.js'

describe('Requester', () => {
  const agent = new MockAgent()

  defineElements(elements)
  setGlobalDispatcher(agent)

  it('should set CSRF token header on POST request', (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'POST',
        path: '/test',
      })
      .reply(200)
      .delay(100)

    Cookies.set('csrf-token', 'abc')

    const requester = new Requester()

    requester.fetch('https://example.com/test', {
      method: 'post',
    })

    test.assert.equal(requester.request?.headers.get('csrf-token'), 'abc')
    Cookies.remove('csrf-token')
  })

  it('should toggle data-loading attribute on element', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(300)

    const divElement = new DivElement()

    divElement.dataset.loadingTimeout = '100'

    const requester = new Requester(divElement)
    const request = requester.fetch('https://example.com/test')

    setTimeout(() => {
      test.assert.equal(divElement.hasAttribute('data-loading'), true)
    }, 200)

    await request
    test.assert.equal(divElement.hasAttribute('data-loading'), false)
  })

  it('should dispatch command event on element', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(300)

    const divElement = new DivElement()

    divElement.dataset.loadingTimeout = '100'

    const requester = new Requester(divElement)
    const request = requester.fetch('https://example.com/test')

    const dispatchEvent = test.mock.method(divElement, 'dispatchEvent', (event: CustomEvent<{ event: string }>) => {
      test.assert.equal(event.type, 'command')
      test.assert.equal(event.detail.event, 'loading')
    })

    await request
    test.assert.equal(dispatchEvent.mock.callCount(), 1)
  })

  it('should reject second fetch before first fetch is finished', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(100)

    await test.assert.rejects(async () => {
      const requester = new Requester()

      requester.fetch('https://example.com/test')
      await requester.fetch('https://example.com/test')
    }, {
      message: /already/u,
    })
  })

  it('should reject request with timeout signal from init', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(200)

    await test.assert.rejects(async () => {
      const requester = new Requester()

      await requester.fetch('https://example.com/test', {
        signal: AbortSignal.timeout(100),
      })
    }, {
      message: /aborted/u,
    })
  })

  it('should reject request with timeout signal from element', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(200)

    await test.assert.rejects(async () => {
      const divElement = new DivElement()
      const requester = new Requester(divElement)

      divElement.dataset.fetchTimeout = '100'
      await requester.fetch('https://example.com/test')
    }, {
      message: /aborted/u,
    })
  })

  it('should reject request with default timeout signal from element', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(300)

    const defaultFetchTimeout = Requester.fetchTimeout

    Requester.fetchTimeout = 200

    await test.assert.rejects(async () => {
      const divElement = new DivElement()
      const requester = new Requester(divElement)

      await requester.fetch('https://example.com/test')
    }, {
      message: /aborted/u,
    })

    Requester.fetchTimeout = defaultFetchTimeout
  })

  it('should return undefined for aborted request', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200)
      .delay(200)

    const requester = new Requester()
    const controller = new AbortController()

    setTimeout(() => {
      controller.abort()
    })

    const response = await requester.fetch('https://example.com/test', {
      signal: controller.signal,
    })

    test.assert.equal(response, undefined)
  })

  it('should reject with custom error in response body', async (test) => {
    const error = new CustomError('message', {
      code: 'code',
      data: {
        key: 'value',
      },
      event: 'error',
      status: 400,
    })

    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(error.status ?? 500, {
        ...error,
        message: error.message,
      }, {
        headers: {
          'content-type': 'application/json',
        },
      })

    const requester = new Requester()

    try {
      await requester.fetch('https://example.com/test')
    } catch (catchError: unknown) {
      test.assert.equal(catchError instanceof CustomError, true)

      if (catchError instanceof CustomError) {
        test.assert.equal(catchError.code, error.code)
        test.assert.deepEqual(catchError.data, error.data)
        test.assert.equal(catchError.message, error.message)
        test.assert.equal(catchError.status, error.status)
      }
    }
  })

  it('should reject with error message in response body', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(500, '<h1>Server Error</h1>', {
        headers: {
          'content-type': 'text/plain',
        },
      })

    const requester = new Requester()

    try {
      await requester.fetch('https://example.com/test')
    } catch (catchError: unknown) {
      test.assert.equal(catchError instanceof CustomError, true)

      if (catchError instanceof CustomError) {
        test.assert.equal(catchError.code, undefined)
        test.assert.equal(catchError.data, undefined)
        test.assert.equal(catchError.message, 'Server Error')
        test.assert.equal(catchError.status, 500)
      }
    }
  })

  it('should reject without error message in response body', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(500, '', {
        headers: {
          'content-type': 'text/plain',
        },
      })

    const requester = new Requester()

    try {
      await requester.fetch('https://example.com/test')
    } catch (catchError: unknown) {
      test.assert.equal(catchError instanceof CustomError, true)

      if (catchError instanceof CustomError) {
        test.assert.equal(catchError.code, 'error_500')
        test.assert.equal(catchError.data, undefined)
        test.assert.equal(catchError.message, 'An error occurred')
        test.assert.equal(catchError.status, 500)
      }
    }
  })

  it('should fetch blob', async (test) => {
    const text = new TextEncoder().encode('key:value')

    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test',
      })
      .reply(200, text.buffer)

    const requester = new Requester()
    const body = await requester.fetchBlob('https://example.com/test')
    const actual = await body?.arrayBuffer()
    const expected = text.buffer

    if (actual !== undefined) {
      test.assert.equal(Buffer.from(actual).equals(Buffer.from(expected)), true)
    }
  })

  it('should fetch JSON', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test.json',
      })
      .reply(200, {
        key: 'value',
      }, {
        headers: {
          'content-type': 'application/json',
        },
      })

    const requester = new Requester()
    const body = await requester.fetchJson('https://example.com/test.json')

    test.assert.deepEqual(body, {
      key: 'value',
    })
  })

  it('should reject JSON with wrong content-type', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test.json',
      })
      .reply(200)

    await test.assert.rejects(async () => {
      await new Requester().fetchJson('https://example.com/test.json')
    }, {
      message: /unexpected/u,
    })
  })

  it('should return undefined for aborted JSON request', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test.json',
      })
      .reply(200)
      .delay(200)

    const requester = new Requester()
    const controller = new AbortController()

    setTimeout(() => {
      controller.abort()
    })

    const response = await requester.fetchJson('https://example.com/test.json', {
      signal: controller.signal,
    })

    test.assert.equal(response, undefined)
  })

  it('should fetch text', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test.txt',
      })
      .reply(200, 'key=value', {
        headers: {
          'content-type': 'text/plain',
        },
      })

    const requester = new Requester()
    const body = await requester.fetchText('https://example.com/test.txt')

    test.assert.equal(body, 'key=value')
  })

  it('should reject text with wrong content-type', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test.txt',
      })
      .reply(200)

    await test.assert.rejects(async () => {
      await new Requester().fetchText('https://example.com/test.txt')
    }, {
      message: /unexpected/u,
    })
  })

  it('should return undefined for aborted text request', async (test) => {
    agent
      .get('https://example.com')
      .intercept({
        method: 'GET',
        path: '/test.txt',
      })
      .reply(200)
      .delay(200)

    const requester = new Requester()
    const controller = new AbortController()

    setTimeout(() => {
      controller.abort()
    })

    const response = await requester.fetchText('https://example.com/test.txt', {
      signal: controller.signal,
    })

    test.assert.equal(response, undefined)
  })
})
