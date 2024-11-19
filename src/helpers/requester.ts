import Cookies from 'js-cookie'
import type { CommandableElement } from './commandable.js'
import { CustomError } from './custom-error.js'

/**
 * Fetches a resource.
 *
 * @example
 * ```typescript
 * interface Address {
 *   addressLine1: string
 *   addressLevel2: string
 * }
 *
 * const requester = new Requester()
 * const address = requester.fetchJson<Address>('/address/1')
 *
 * const isAddress = isObject<Address>(address, (value) => {
 *   return (
 *     Object.hasOwn(value, 'addressLine1') &&
 *     Object.hasOwn(value, 'addressLevel2')
 *   )
 * })
 *
 * console.log(isAddress) // true
 * ```
 */
export class Requester {
  /**
   * Used to transform the textual representation of an error in the response body into a {@link CustomError}
   *
   * The message of the error should be returned by the regular expression as a capturing group with name "error".
   */
  public static errorMatchers = [
    /<h1>(?<error>.+?)<\/h1>/u,
  ]

  /**
   * The controller to abort a request.
   */
  public abortController?: AbortController

  /**
   * The element on behalf of which the request is made.
   */
  public element?: CommandableElement

  /**
   * The current request.
   */
  public request?: Request

  /**
   * Creates a requester.
   *
   * @param element the element
   */
  public constructor(element?: CommandableElement) {
    this.element = element
  }

  /**
   * Fetches a resource.
   *
   * Throws an error if a request is already being made.
   *
   * Adds a `csrf-token` header to the reqeust if a cookie with the same name exists.
   *
   * Adds an `AbortSignal` to the request. If `data-fetch-timeout` is set on {@link element} with a value of -1 no `AbortSignal` is added, otherwise the value is taken as the duration of the timeout (default to 10000 ms). When no {@link element} is set, the `signal` property from {@link init} is used.
   *
   * Toggles a `data-loading` attribute on {@link element} after 1000 ms. This duration can be changed with the attribute `data-loading-timeout` on {@link element}. Also executes commands set with the attribute `data-onloading` on {@link element}.
   *
   * Returns the response if its status < 400. Otherwise tries to parse the response body into a {@link CustomError}. Two cases are handled:
   *
   * 1. If the content-type of the response is `application/json` it is assumed that it contains a symmetric specification of a {@link CustomError}.
   * 2. Otherwise the text of the response is parsed using {@link errorMatchers}. The `code` of the {@link CustomError} is set to `error_${response.status}` and the `status` to `response.status`.
   *
   * @param input the input
   * @param init the init
   */
  public async fetch(input: Request | string | URL, init?: RequestInit): Promise<Response | undefined> {
    if (this.request !== undefined) {
      throw new CustomError('Request is already being fetched', {
        code: 'requester_double_fetch',
        event: 'doublefetch',
      })
    }

    this.abortController = new AbortController()

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

    const {
      fetchTimeout = '10000',
      loadingTimeout = '1000',
    } = this.element?.dataset ?? {}

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

      if (response.status < 400) {
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

        throw new CustomError(match?.groups?.error ?? 'An error occurred', {
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

  /**
   * Fetches a resource as a blob.
   *
   * @param input the input
   * @param init the init
   */
  public async fetchBlob(input: Request | string | URL, init?: RequestInit): Promise<Blob | undefined> {
    return await this
      .fetch(input, init)
      .then(async (response) => {
        return await response?.blob()
      })
  }

  /**
   * Fetches a resource as JSON.
   *
   * Throws an error if the content-type of the response is not `application/json`.
   *
   * @param input the input
   * @param init the init
   */
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

  /**
   * Fetches a resource as text.
   *
   * Throws an error if the content-type of the response is not `text/plain`.
   *
   * @param input the input
   * @param init the init
   */
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

  /**
   * Handles an error. Returns undefined if {@link error} is an `AbortError`, otherwise throws the error.
   *
   * @param error the error
   */
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
