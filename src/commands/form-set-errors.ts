import type { CustomError } from '../util/custom-error.js'
import { Command } from '../commander/command.js'
import { isObject } from '../util/is-object.js'

/**
 * Command data.
 */
export interface FormSetErrorsCommandData {
  /**
   * The error.
   */
  error: CustomError
}

/**
 * A command to set errors in a form.
 *
 * Sets visual errors messages for the `<input>`, `<select>` and `<textarea>` elements in a form.
 *
 * Iterates over `data.error` with the keys as the IDs of the elements for which a message should be set and the values as the messages.
 *
 * @example
 * ```html
 * <form
 *   data-oninputerror="form-set-errors"
 *   method="post"
 * >
 *   <label for="email">
 *     Email address
 *     <span data-error></span>
 *   </label>
 *   <br>
 *   <input
 *     id="email"
 *     name="email"
 *     type="email"
 *   >
 * </form>
 * ```
 *
 * The response body should contain the JSON representation of a CustomError:
 *
 * ```json
 * {
 *   "code": "error_400",
 *   "data": {
 *     "email": "Please enter a valid email address"
 *   },
 *   "event": "inputerror",
 *   "status": 400
 * }
 * ```
 */
export class FormSetErrorsCommand extends Command<HTMLFormElement> {
  /**
   * Executes the command.
   *
   * @param data the data
   */
  public execute(data?: FormSetErrorsCommandData): void {
    const errorData = data?.error.data

    if (isObject<Record<string, string>>(errorData)) {
      Object
        .entries(errorData)
        .forEach(([id, message]) => {
          const element = this.targetElement.querySelector(`label[for="${id}"] [data-error]`)

          if (element instanceof HTMLElement) {
            element.textContent = message
          }
        })
    }
  }
}
