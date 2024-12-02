import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { CommandRegistry } from '../../src/commander/command-registry.js'
import { Command } from '../../src/commander/command.js'

describe('CommandRegistry', () => {
  class CustomCommand extends Command {
    public override execute(): void {}
  }

  document.body.innerHTML = `
    <div id="div"></div>
    <button id="button"></button>
  `

  it('should create singleton', (test) => {
    const registry1 = CommandRegistry.create()
    const registry2 = CommandRegistry.create()

    test.assert.equal(registry1, registry2)
  })

  it('should define command', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)
    test.assert.equal(registry.get('custom-command'), CustomCommand)
  })

  it('should create command', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')
    const targetElement = document.getElementById('div')

    if (originElement !== null) {
      const command = registry.create('custom-command@div', originElement)

      test.assert.equal(command.originElement, originElement)
      test.assert.equal(command.targetElement, targetElement)
    }
  })

  it('should create command with options', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')

    if (originElement !== null) {
      const command = registry.create('custom-command@div?key=value', originElement)

      test.assert.deepEqual(command.options, {
        key: 'value',
      })
    }
  })

  it('should create command with multiple options with same key', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')

    if (originElement !== null) {
      const command = registry.create('custom-command@div?key=value-1&key=value-2', originElement)

      test.assert.deepEqual(command.options, {
        key: [
          'value-1',
          'value-2',
        ],
      })
    }
  })

  it('should create command without target specification', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')

    if (originElement !== null) {
      const command = registry.create('custom-command', originElement)

      test.assert.equal(command.originElement, originElement)
      test.assert.equal(command.targetElement, originElement)
    }
  })

  it('should create command without window as target', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')

    if (originElement !== null) {
      const command = registry.create('custom-command@window', originElement)

      test.assert.equal(command.originElement, originElement)
      test.assert.equal(command.targetElement, window)
    }
  })

  it('should create command with inverted origin and target', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')
    const targetElement = document.getElementById('div')

    if (originElement !== null) {
      const command = registry.create('custom-command@div', originElement, true)

      test.assert.equal(command.originElement, targetElement)
      test.assert.equal(command.targetElement, originElement)
    }
  })

  it('should throw error when command is undefined', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')

    if (originElement !== null) {
      test.assert.throws(() => {
        registry.create('other-command', originElement)
      }, /undefined/u)
    }
  })

  it('should throw error when target is undefined', (test) => {
    const registry = new CommandRegistry()

    registry.define('custom-command', CustomCommand)

    const originElement = document.getElementById('button')

    if (originElement !== null) {
      test.assert.throws(() => {
        registry.create('custom-command@dialog', originElement)
      }, /undefined/u)
    }
  })
})
