import type { Constructor } from 'type-fest'
import type { Command } from '../commander/command.js'
import { CommandRegistry } from '../commander/command-registry.js'

/**
 * Adds custom commands to the registry.
 *
 * Constructs the external name by which the custom command can be used in attributes in the following way:
 *
 * 1. The postfix `Command` is removed from the class name.
 * 2. The remaining string is transformed from pascal case to kebab case.
 * 3. The prefix is added.
 *
 * @example
 * ```javascript
 * class GetSomethingCommand extends Command {
 *   execute() {
 *     // do something
 *   }
 * }
 *
 * defineCommands({
 *   GetSomethingCommand
 * }, 'my-')
 *
 * console.log(window.customCommands.get('my-get-something') === GetSomethingCommand) // true
 * ```
 *
 * @param commands the object with custom commands
 * @param prefix the prefix to add to the external name of the custom commands
 * @param registry the registry to add the custom commands to
 */
export function defineCommands(commands: Record<string, Constructor<Command>>, prefix = '', registry = CommandRegistry.create()): void {
  Object
    .entries(commands)
    .forEach(([fullName, command]) => {
      const name = fullName
        .replace('Command', '')
        .replace(/(?<one>[a-z0–9])(?<two>[A-Z])/gu, '$1-$2')
        .toLowerCase()

      registry.define(`${prefix}${name}`, command)
    })
}
