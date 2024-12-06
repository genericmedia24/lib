export * from './button-submit.js'
export * from './define.js'
export * from './dialog-close.js'
export * from './dialog-show.js'
export * from './dialog-toggle.js'
export * from './element-abort-request.js'
export * from './element-clear-html.js'
export * from './element-focus.js'
export * from './element-remove.js'
export * from './element-set-state.js'
export * from './element-set-text-content.js'
export * from './element-toggle-attribute.js'
export * from './element-toggle-flex.js'
export * from './element-toggle-height.js'
export * from './element-toggle-margin.js'
export * from './element-toggle-state.js'
export * from './element-update.js'
export * from './form-respond.js'
export * from './form-set-errors.js'
export * from './form-submit.js'
export * from './input-set-error.js'
export * from './input-set-state.js'
export * from './input-set-value.js'
export * from './popover-hide.js'
export * from './popover-show.js'
export * from './select-toggle.js'

import { ButtonSubmitCommand } from './button-submit.js'
import { DialogCloseCommand } from './dialog-close.js'
import { DialogShowCommand } from './dialog-show.js'
import { DialogToggleCommand } from './dialog-toggle.js'
import { ElementAbortRequestCommand } from './element-abort-request.js'
import { ElementClearHtmlCommand } from './element-clear-html.js'
import { ElementFocusCommand } from './element-focus.js'
import { ElementRemoveCommand } from './element-remove.js'
import { ElementSetStateCommand } from './element-set-state.js'
import { ElementSetTextContentCommand } from './element-set-text-content.js'
import { ElementToggleAttributeCommand } from './element-toggle-attribute.js'
import { ElementToggleFlexCommand } from './element-toggle-flex.js'
import { ElementToggleHeightCommand } from './element-toggle-height.js'
import { ElementToggleMarginCommand } from './element-toggle-margin.js'
import { ElementToggleStateCommand } from './element-toggle-state.js'
import { ElementUpdateCommand } from './element-update.js'
import { FormRespondCommand } from './form-respond.js'
import { FormSetErrorsCommand } from './form-set-errors.js'
import { FormSubmitCommand } from './form-submit.js'
import { InputSetErrorCommand } from './input-set-error.js'
import { InputSetStateCommand } from './input-set-state.js'
import { InputSetValueCommand } from './input-set-value.js'
import { PopoverHideCommand } from './popover-hide.js'
import { PopoverShowCommand } from './popover-show.js'
import { SelectToggleCommand } from './select-toggle.js'

/**
 * Custom commands.
 */
export const commands = {
  /**
   * A button submit command.
   */
  ButtonSubmitCommand,

  /**
   * A command to submit a form with a button.
   */
  DialogCloseCommand,

  /**
   * A command to show a dialog.
   */
  DialogShowCommand,

  /**
   * A command to toggle a dialog.
   */
  DialogToggleCommand,

  /**
   * A command to abort the request of an element.
   */
  ElementAbortRequestCommand,

  /**
   * A command to clear the HTML of an element.
   */
  ElementClearHtmlCommand,

  /**
   * A command to focus an element.
   */
  ElementFocusCommand,

  /**
   * A command to remove an element.
   */
  ElementRemoveCommand,

  /**
   * A command to set the state of an element.
   */
  ElementSetStateCommand,

  /**
   * A command to set the text content of an element.
   */
  ElementSetTextContentCommand,

  /**
   * A command to toggle an attribute of an element.
   */
  ElementToggleAttributeCommand,

  /**
   * A command to toggle the CSS `flex` property of an element.
   */
  ElementToggleFlexCommand,

  /**
   * A command to toggle the CSS `height` property of an element.
   */
  ElementToggleHeightCommand,

  /**
   * A command to toggle the CSS `margin` property of an element.
   */
  ElementToggleMarginCommand,

  /**
   * A command to toggle the state of an element.
   */
  ElementToggleStateCommand,

  /**
   * A command to update an element.
   */
  ElementUpdateCommand,

  /**
   * A command to handle the response of a form.
   */
  FormRespondCommand,

  /**
   * A command to set errors in a form.
   */
  FormSetErrorsCommand,

  /**
   * A command to submit a form.
   */
  FormSubmitCommand,

  /**
   * A command to set the error of an input.
   */
  InputSetErrorCommand,

  /**
   * A command to set the state of an input.
   */
  InputSetStateCommand,

  /**
   * A command to set the value of an input.
   */
  InputSetValueCommand,

  /**
   * A command to hide a popover.
   */
  PopoverHideCommand,

  /**
   * A command to show a popover.
   */
  PopoverShowCommand,

  /**
   * A command to toggle elements based on a select value.
   */
  SelectToggleCommand,
}
