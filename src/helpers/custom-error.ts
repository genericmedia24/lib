import { isPrimitive } from './is-primitive.js'

export interface CustomErrorOptions extends ErrorOptions {
  code?: string
  data?: Record<string, unknown>
  event?: string
  status?: number
}

export class CustomError extends Error {
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

  public code?: string

  public data?: Record<string, unknown>

  public event?: string

  public status?: number

  public constructor(message: string, options?: CustomErrorOptions) {
    super(message, options)
    this.code = options?.code
    this.data = options?.data
    this.event = options?.event
    this.status = options?.status
  }
}
