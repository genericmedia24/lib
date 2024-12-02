import 'global-jsdom/register'
import { describe, it } from 'node:test'
import type { FormElement } from '../../src/elements/form.js'
import { FormSubmitCommand } from '../../src/commands/form-submit.js'
import { defineElements } from '../../src/elements/define.js'
import { elements } from '../../src/elements/index.js'
import { isObject } from '../../src/util/is-object.js'

describe('FormSubmitCommand', () => {
  defineElements(elements)

  it('should submit form with options from form', async (test) => {
    document.body.innerHTML = `
      <form action="https://example.com/test" method="get" is="gm-form">
        <input name="query" value="test">
      </form>
    `
    const formElement = document.querySelector<FormElement>('form')

    if (formElement !== null) {
      const command = new FormSubmitCommand(formElement, formElement)
      const commanderExecute = test.mock.method(formElement.commander, 'execute')

      const event = new SubmitEvent('submit')
      const response = new Response()

      const requesterFetch = test.mock.method(command.requester, 'fetch', async () => {
        return await Promise.resolve(response)
      })

      command.execute({
        event,
      })

      test.assert.equal(requesterFetch.mock.callCount(), 1)
      test.assert.equal(requesterFetch.mock.calls.at(0)?.arguments.at(0), 'https://example.com/test?query=test')

      const init = requesterFetch.mock.calls.at(0)?.arguments.at(1)

      if (isObject<RequestInit>(init)) {
        test.assert.equal(init.method, 'get')
      }

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      test.assert.equal(commanderExecute.mock.callCount(), 1)
      test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'response')

      test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
        response,
      })
    }
  })

  it('should submit form with options from submitter', async (test) => {
    document.body.innerHTML = `
      <form action="https://example.com" enctype="application/x-www-form-urlencoded" method="get" is="gm-form">
        <input name="query" value="test">
        <button formaction="https://example.com/test" formenctype="multipart/form-data" formmethod="post"></button>
      </form>
    `
    const buttonElement = document.querySelector<FormElement>('button')
    const formElement = document.querySelector<FormElement>('form')

    if (
      buttonElement !== null &&
      formElement !== null
    ) {
      const command = new FormSubmitCommand(formElement, formElement)
      const commanderExecute = test.mock.method(formElement.commander, 'execute')

      const event = new SubmitEvent('submit', {
        submitter: buttonElement,
      })

      const response = new Response()

      const requesterFetch = test.mock.method(command.requester, 'fetch', async () => {
        return await Promise.resolve(response)
      })

      command.execute({
        event,
      })

      test.assert.equal(requesterFetch.mock.callCount(), 1)
      test.assert.equal(requesterFetch.mock.calls.at(0)?.arguments.at(0), 'https://example.com/test')

      const init = requesterFetch.mock.calls.at(0)?.arguments.at(1)

      if (isObject<RequestInit>(init)) {
        test.assert.equal(init.body instanceof window.FormData, true)

        if (isObject<FormData>(init.body)) {
          test.assert.equal(init.body.get('query'), 'test')
        }

        test.assert.equal(init.method, 'post')
      }

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      test.assert.equal(commanderExecute.mock.callCount(), 1)
      test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'response')

      test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
        response,
      })
    }
  })

  it('should submit form with post and application/x-www-form-urlencoded', async (test) => {
    document.body.innerHTML = `
      <form action="https://example.com/test" enctype="application/x-www-form-urlencoded" method="post" is="gm-form">
        <input name="query" value="test">
      </form>
    `
    const formElement = document.querySelector<FormElement>('form')

    if (formElement !== null) {
      const command = new FormSubmitCommand(formElement, formElement)
      const commanderExecute = test.mock.method(formElement.commander, 'execute')
      const event = new SubmitEvent('submit')
      const response = new Response()

      const requesterFetch = test.mock.method(command.requester, 'fetch', async () => {
        return await Promise.resolve(response)
      })

      command.execute({
        event,
      })

      test.assert.equal(requesterFetch.mock.callCount(), 1)
      test.assert.equal(requesterFetch.mock.calls.at(0)?.arguments.at(0), 'https://example.com/test')

      const init = requesterFetch.mock.calls.at(0)?.arguments.at(1)

      if (isObject<RequestInit>(init)) {
        test.assert.equal(init.body instanceof window.URLSearchParams, true)

        if (isObject<URLSearchParams>(init.body)) {
          test.assert.equal(init.body.get('query'), 'test')
        }

        test.assert.equal(init.method, 'post')
      }

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      test.assert.equal(commanderExecute.mock.callCount(), 1)
      test.assert.equal(commanderExecute.mock.calls.at(0)?.arguments.at(0), 'response')

      test.assert.deepEqual(commanderExecute.mock.calls.at(0)?.arguments.at(1), {
        response,
      })
    }
  })

  it('should handle error', async (test) => {
    test.mock.method(console, 'error', () => {})

    document.body.innerHTML = `
      <form action="https://example.com" enctype="application/x-www-form-urlencoded" method="post" is="gm-form">
        <input name="query" value="test">
      </form>
    `
    const formElement = document.querySelector<FormElement>('form')

    if (formElement !== null) {
      const command = new FormSubmitCommand(formElement, formElement)
      const commanderHandleError = test.mock.method(formElement.commander, 'handleError')
      const error = new Error('error')
      const event = new SubmitEvent('submit')

      test.mock.method(command.requester, 'fetch', async () => {
        return await Promise.reject(error)
      })

      command.execute({
        event,
      })

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      test.assert.equal(commanderHandleError.mock.callCount(), 1)
      test.assert.equal(commanderHandleError.mock.calls.at(0)?.arguments.at(0), error)
    }
  })
})
