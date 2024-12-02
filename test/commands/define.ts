import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { CommandRegistry } from '../../src/commander/command-registry.js'
import { Command } from '../../src/commander/command.js'
import { defineCommands } from '../../src/commands/define.js'
import { ButtonSubmitCommand, commands } from '../../src/commands/index.js'

describe('define', () => {
  const registry = CommandRegistry.create()

  it('should define custom element that extends built-in element', (test) => {
    defineCommands(commands)
    test.assert.equal(registry.get('button-submit'), ButtonSubmitCommand)
  })

  it('should define custom element with different prefix', (test) => {
    class CustomCommand extends Command {
      public override execute(): void {}
    }

    defineCommands({
      CustomCommand,
    }, 'test-')

    test.assert.equal(registry.get('test-custom'), CustomCommand)
  })
})
