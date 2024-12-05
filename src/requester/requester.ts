import Cookies from 'js-cookie'
import { CustomError } from '../util/custom-error.js'
import { isNil } from '../util/is-nil.js'

/**
 * Fetches a resource.
 *
 * When an element is passed to the constructur, feedback about the request will be given on the element. See {@link fetch} from more information.
 *
 * See [a live example](../../docs/examples/requester.html) of the code below.
 *
 * @example
 * ```html
 * <body>
 *   <div data-loading-timeout="0" is="gm-div">loading...</div>
 * </body>
 * ```
 *
 * ```javascript
 * const element = document.body.querySelector('div')
 * const requester = new Requester(element)
 * const result = await requester.fetchJson('https://cdn.jsdelivr.net/npm/@genericmedia/lib/package.json')
 *
 * element.setHTMLUnsafe(result.version)
 * ```
 *
 * The requester can also be used without an element.
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
   * The message of the error should be returned by the regular expression as a capturing group with name `error`.
   */
  public static errorMatchers = [
    /<h1>(?<error>.+?)<\/h1>/u,
  ]

  /**
   * The amount of milliseconds before a request on an element is timed out.
   */
  public static fetchTimeout = 10000

  /**
   * The controller to abort a request.
   */
  public abortController?: AbortController

  /**
   * The element on behalf of which the request is made.
   */
  public element?: HTMLElement

  /**
   * The ID of the loading timeout.
   */
  public loadingTimeoutId?: number

  /**
   * The current request.
   */
  public request?: Request

  /**
   * Creates a requester.
   *
   * @param element the element
   */
  public constructor(element?: HTMLElement) {
    this.element = element
  }

  /**
   * Fetches a resource.
   *
   * Throws an error if a request is already being made.
   *
   * Adds the signal of {@link abortController} to the request.
   *
   * Also adds a timeout signal to the request. The duration of the timeout can be changed with the `data-fetch-timeout` attribute on {@link element} (defaults to {@link fetchTimeout}). If set to -1 no timeout signal is added. If the requester is instantiated without {@link element} the signal from {@link init} is used, if set.
   *
   * Adds a `csrf-token` header to a POST request if a cookie with the same name exists.
   *
   * Toggles a `data-loading` attribute on {@link element}. Also dispatches a custom event named `command`, which can be handled by a {@link commander!Commander | Commander}. Does so after a timeout. The duration of the timeout can be changed with the `data-loading-timeout` attribute on {@link element} (defaults to 1000 ms). No-op if the requester is instantiated without {@link element}.
   *
   * Returns the response if its status < 400. Otherwise tries to parse the response body into a {@link CustomError}. Two cases are handled:
   *
   * 1. If the content-type of the response is `application/json` it is assumed that it contains a symmetric specification of a {@link CustomError}.
   * 2. Otherwise the text of the response is parsed using {@link errorMatchers}. The {@link CustomError.code} is set to `error_${response.status}` and the {@link CustomError.status} to `response.status`.
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

    const signals = [
      this.abortController.signal,
    ]

    if (this.element !== undefined) {
      if (this.element.dataset.fetchTimeout !== '-1') {
        signals.push(AbortSignal.timeout(Number(this.element.dataset.fetchTimeout ?? Requester.fetchTimeout)))
      }
    } else if (init?.signal instanceof AbortSignal) {
      signals.push(init.signal)
    }

    this.request = new Request(input, {
      ...init,
      signal: AbortSignal.any(signals),
    })

    if (this.request.method.toLowerCase() === 'post') {
      const csrfToken = Cookies.get('csrf-token')

      if (csrfToken !== undefined) {
        this.request.headers.set('csrf-token', csrfToken)
      }
    }

    if (this.element !== undefined) {
      this.loadingTimeoutId = window.setTimeout(() => {
        this.element?.toggleAttribute('data-loading', true)

        this.element?.dispatchEvent(new window.CustomEvent('command', {
          detail: {
            event: 'loading',
          },
        }))
      }, Number(this.element.dataset.loadingTimeout ?? 1000))
    }

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
          code: isNil(match)
            ? `error_${response.status}`
            : undefined,
          status: response.status,
        })
      }
    } catch (error: unknown) {
      return this.handleError(error)
    } finally {
      clearTimeout(this.loadingTimeoutId)
      this.element?.toggleAttribute('data-loading', false)
      this.abortController = undefined
      this.loadingTimeoutId = undefined
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
   * Handles an error. Returns `undefined` if `error`` is an `AbortError`, otherwise throws the error.
   *
   * @param error the error
   */
  protected handleError(error: unknown): undefined {
    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      return undefined
    }

    throw error
  }
}
