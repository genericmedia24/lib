import { isPrimitive } from './is-primitive.js'

export interface CustomErrorOptions extends ErrorOptions {
  /**
   * A machine-readable error code, e.g. err_operation_failed.
   */
  code?: string

  /**
   * Error-specific data that will help to solve the cause of the error.
   */
  data?: Record<string, unknown>

  /**
   * An event. Useful in combination with custom commands.
   */
  event?: string

  /**
   * An HTTP status code.
   */
  status?: number
}

/**
 * An error with some extra flavour.
 *
 * @example
 * ```javascript
 * const error = new CustomError('Operation failed', {
 *   code: 'err_operation_failed',
 * })
 *
 * console.log(error.message === 'Operation failed') // true
 * console.log(error.code === 'err_operation_failed') // true
 * ```
 */
export class CustomError extends Error {
  /**
   * Creates a custom error from an error with an unknown type.
   *
   * Five different cases are handled:
   *
   * 1. If error is a CustomError it is returned immediately.
   * 2. If error is an AggregateError, the message of the first error will be passed to the constructor. If there are no errors the message of the AggregatError itself will be used.
   * 3. If error is an Error, ErrorEvent of DOMEXception, its message will be passed to the constructor and the error will be passed as a cause to the options.
   * 4. If error is a primitive it will be stringified and passed to the constructor as the message. If the message if undefined or null a default message will be passed to the constructor.
   * 5. If error is none of the above a default message will be passed to the constructor.
   *
   * @example
   * ```javascript
   * const cause = new Error('Operation failed')
   *
   * const error = CustomError.from(cause, {
   *   code: 'err_operation_failed',
   *   data: {
   *     key: 'value',
   *   },
   *   event: 'failed',
   *   status: 500,
   * })
   *
   * console.log(error.message === 'Operation failed') // true
   * console.log(error.code === 'err_operation_failed') // true
   * ```
   *
   * @param error the error
   * @param options options
   */
  public static from(error: unknown, options?: CustomErrorOptions): CustomError {
    if (error instanceof CustomError) {
      return error
    } else if (error instanceof AggregateError) {
      const firstError = error.errors.find((value) => {
        return value instanceof Error
      })

      return CustomError.from(firstError ?? error.message, options)
    } else if (
      error instanceof Error ||
      error instanceof ErrorEvent ||
      error instanceof DOMException
    ) {
      return new CustomError(error.message, {
        cause: error,
        ...options,
      })
    } else if (isPrimitive(error)) {
      return new CustomError(error?.toString() ?? 'An error occurred', options)
    }

    return new CustomError('An error occurred', options)
  }

  /**
   * A machine-readable error code, e.g. err_operation_failed.
   */
  public code?: string

  /**
   * Error-specific data that will help to solve the cause of the error.
   */
  public data?: Record<string, unknown>

  /**
   * An event. Useful in combination with custom commands.
   */
  public event?: string

  /**
   * An HTTP status code.
   */
  public status?: number

  /**
   * Creates a custom error.
   *
   * @param message the message
   * @param options the options
   */
  public constructor(message: string, options?: CustomErrorOptions) {
    super(message, options)
    this.code = options?.code
    this.data = options?.data
    this.event = options?.event
    this.status = options?.status
  }
}
