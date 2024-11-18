import Cookies from 'js-cookie'
import type { CommandableElement } from './commandable.js'
import { CustomError } from './custom-error.js'

export class Requester {
  public static errorMatchers = [
    /<h1>(?<error>.+?)<\/h1>/u,
  ]

  public abortController?: AbortController

  public element?: CommandableElement

  public request?: Request

  public constructor(element?: CommandableElement) {
    this.element = element
  }

  public async fetch(input: Request | string | URL, init?: RequestInit): Promise<Response | undefined> {
    if (this.request !== undefined) {
      throw new CustomError('Request is already being fetched', {
        code: 'requester_double_fetch',
        event: 'doublefetch',
      })
    }

    this.abortController = new AbortController()

    const {
      fetchTimeout = '10000',
      loadingTimeout = '1000',
    } = this.element?.dataset ?? {}

    const csrfToken = Cookies.get('csrf-token')

    if (csrfToken !== undefined) {
      if (
        input instanceof Request &&
        input.method.toLowerCase() === 'post'
      ) {
        input.headers.set('csrf-token', csrfToken)
      } else if (
        init !== undefined &&
        init.method?.toLowerCase() === 'post'
      ) {
        init.headers = {
          ...init.headers,
          'csrf-token': csrfToken,
        }
      }
    }

    const signals = [
      this.abortController.signal,
    ]

    if (init?.signal !== undefined) {
      if (init.signal !== null) {
        signals.push(init.signal)
      }
    } else if (fetchTimeout !== '-1') {
      signals.push(AbortSignal.timeout(Number(fetchTimeout)))
    }

    this.request = new Request(input, {
      ...init,
      signal: AbortSignal.any(signals),
    })

    const loadingTimer = setTimeout(() => {
      this.element?.toggleAttribute('data-loading', true)
      this.element?.commander.execute('loading')
    }, Number(loadingTimeout))

    try {
      const response = await fetch(this.request)

      if (response.status === 200) {
        return response
      }

      const contentType = response.headers.get('content-type')

      if (contentType?.startsWith('application/json') === true) {
        const error = await response.json() as CustomError
        throw new CustomError(error.message, error)
      } else {
        const text = await response.text()

        const match = Requester.errorMatchers.find((errorMatcher) => {
          return errorMatcher.test(text)
        })?.exec(text)

        throw new CustomError(match?.[1] ?? 'An error occurred', {
          code: match === null
            ? `error_${response.status}`
            : undefined,
          status: response.status,
        })
      }
    } catch (error: unknown) {
      this.handleError(error)
      return undefined
    } finally {
      clearTimeout(loadingTimer)
      this.element?.toggleAttribute('data-loading', false)
      this.abortController = undefined
      this.request = undefined
    }
  }

  public async fetchBlob(input: Request | string | URL, init?: RequestInit): Promise<Blob | undefined> {
    return await this
      .fetch(input, init)
      .then(async (response) => {
        return await response?.blob()
      })
  }

  public async fetchJson<Result>(input: Request | string | URL, init?: RequestInit): Promise<Result | undefined> {
    return await this
      .fetch(input, init)
      .then(async (response) => {
        if (response === undefined) {
          return undefined
        }

        const contentType = response.headers.get('content-type')

        if (contentType?.startsWith('application/json') !== true) {
          throw new Error('Content type is unexpected')
        }

        return await response.json() as Result
      })
  }

  public async fetchText(input: Request | string | URL, init?: RequestInit): Promise<string | undefined> {
    return await this
      .fetch(input, init)
      .then(async (response) => {
        if (response === undefined) {
          return undefined
        }

        const contentType = response.headers.get('content-type')

        if (contentType?.startsWith('text/plain') !== true) {
          throw new Error('Content type is unexpected')
        }

        return await response.text()
      })
  }

  protected handleError(error: unknown): void {
    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      return
    }

    throw error
  }
}
