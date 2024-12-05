import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { CommandRegistry } from '../../src/commander/command-registry.js'
import { Command } from '../../src/commander/command.js'
import { Commander } from '../../src/commander/commander.js'
import { defineElements } from '../../src/elements/define.js'
import { type ButtonElement, elements } from '../../src/elements/index.js'

describe('Commander', () => {
  defineElements(elements)

  class ClickCommand extends Command {
    public override execute(): void {}
  }

  class ErrorCommand extends Command {
    public override execute(): void {}
  }

  class StateCommand extends Command {
    public override execute(): void {}
  }

  const registry = CommandRegistry.create()

  registry.define('click-command', ClickCommand)
  registry.define('error-command', ErrorCommand)
  registry.define('state-command', StateCommand)

  it('should start', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onclick="click-command@div"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()
      test.assert.equal(buttonElement.commander.started, true)
      test.assert.equal(buttonElement.commander.commands.click?.at(0) instanceof ClickCommand, true)
    }
  })

  it('should stop', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onclick="click-command@div"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()
      test.assert.equal(buttonElement.commander.started, true)
      test.assert.equal(buttonElement.commander.commands.click?.at(0) instanceof ClickCommand, true)
      buttonElement.commander.stop()
      test.assert.equal(buttonElement.commander.started, false)
      test.assert.equal(buttonElement.commander.commands.click?.at(0) instanceof ClickCommand, false)
    }
  })

  it('should start with inverted commands', async (test) => {
    document.body.innerHTML = `
      <div id="div" data-ofclick="click-command@button"></div>
      <button id="button" is="gm-button"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')
    const divElement = document.querySelector<ButtonElement>('div')

    if (
      buttonElement !== null &&
      divElement !== null
    ) {
      divElement.commander = new Commander(divElement)
      divElement.commander.start()

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      test.assert.equal(divElement.commander.started, true)
      test.assert.equal(buttonElement.commander.commands.click?.at(0) instanceof ClickCommand, true)
    }
  })

  it('should stop with inverted commands', async (test) => {
    document.body.innerHTML = `
      <div id="div" data-ofclick="click-command@button"></div>
      <button id="button" is="gm-button"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')
    const divElement = document.querySelector<ButtonElement>('div')

    if (
      buttonElement !== null &&
      divElement !== null
    ) {
      divElement.commander = new Commander(divElement)
      divElement.commander.start()

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      test.assert.equal(divElement.commander.started, true)
      test.assert.equal(buttonElement.commander.commands.click?.at(0) instanceof ClickCommand, true)
      divElement.commander.stop()
      test.assert.equal(divElement.commander.started, false)
      test.assert.equal(divElement.commander.commands.click?.at(0) instanceof ClickCommand, false)
    }
  })

  it('should execute command', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onclick="click-command@div"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()

      const clickCommand = buttonElement.commander.commands.click?.at(0)

      if (clickCommand !== undefined) {
        const clickCommandExecute = test.mock.method(clickCommand, 'execute')

        buttonElement.commander.execute('click')
        test.assert.equal(clickCommandExecute.mock.callCount(), 1)
      }
    }
  })

  it('should execute command with data', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onclick="click-command@div"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()

      const clickCommand = buttonElement.commander.commands.click?.at(0)

      if (clickCommand !== undefined) {
        const clickCommandExecute = test.mock.method(clickCommand, 'execute')

        buttonElement.commander.execute('click', {
          key: 'value',
        })

        test.assert.equal(clickCommandExecute.mock.callCount(), 1)

        test.assert.deepEqual(clickCommandExecute.mock.calls.at(0)?.arguments.at(0), {
          key: 'value',
        })
      }
    }
  })

  it('should execute all commands', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onclick="click-command@div"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()

      const clickCommand = buttonElement.commander.commands.click?.at(0)

      if (clickCommand !== undefined) {
        const clickCommandExecute = test.mock.method(clickCommand, 'execute')

        buttonElement.commander.executeAll([
          {
            data: {
              key: 'value',
            },
            event: 'click',
          },
        ])

        test.assert.equal(clickCommandExecute.mock.callCount(), 1)

        test.assert.deepEqual(clickCommandExecute.mock.calls.at(0)?.arguments.at(0), {
          key: 'value',
        })
      }
    }
  })

  it('should execute state', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onstatechanged="state-command" data-onkeychanged="state-command"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()

      const statechangedCommand = buttonElement.commander.commands.statechanged?.at(0)
      const keychangedCommand = buttonElement.commander.commands.keychanged?.at(0)

      if (
        statechangedCommand !== undefined &&
        keychangedCommand !== undefined
      ) {
        const statechangedCommandExecute = test.mock.method(statechangedCommand, 'execute')
        const keychangedCommandExecute = test.mock.method(statechangedCommand, 'execute')

        buttonElement.commander.executeState({
          key: 'value',
        }, {
          key: undefined,
        })

        test.assert.equal(statechangedCommandExecute.mock.callCount(), 1)

        test.assert.deepEqual(statechangedCommandExecute.mock.calls.at(0)?.arguments.at(0), {
          newValues: {
            key: 'value',
          },
          oldValues: {
            key: undefined,
          },
        })

        test.assert.equal(keychangedCommandExecute.mock.callCount(), 1)

        test.assert.deepEqual(keychangedCommandExecute.mock.calls.at(0)?.arguments.at(0), {
          newValues: {
            key: 'value',
          },
          oldValues: {
            key: undefined,
          },
        })
      }
    }
  })

  it('should handle command event', (test) => {
    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onloading="loading-command"></button>
    `

    registry.define('loading-command', class extends Command {
      public override execute(): void {}
    })

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()

      const loadingCommand = buttonElement.commander.commands.loading?.at(0)

      if (loadingCommand !== undefined) {
        const loadingCommandExecute = test.mock.method(loadingCommand, 'execute')

        buttonElement.dispatchEvent(new window.CustomEvent('command', {
          detail: {
            data: {
              key: 'value',
            },
            event: 'loading',
          },
        }))

        test.assert.equal(loadingCommandExecute.mock.callCount(), 1)

        test.assert.deepEqual(loadingCommandExecute.mock.calls.at(0)?.arguments.at(0), {
          key: 'value',
        })
      }
    }
  })

  it('should handle error', (test) => {
    const consoleError = test.mock.method(console, 'error', () => {})

    document.body.innerHTML = `
      <div id="div" is="gm-div"></div>
      <button id="button" data-onerror="error-command" data-onclick="click-command@div"></button>
    `

    const buttonElement = document.querySelector<ButtonElement>('button')

    if (buttonElement !== null) {
      buttonElement.commander = new Commander(buttonElement)
      buttonElement.commander.start()

      const clickCommand = buttonElement.commander.commands.click?.at(0)
      const errorCommand = buttonElement.commander.commands.error?.at(0)

      if (
        clickCommand !== undefined &&
        errorCommand !== undefined
      ) {
        const clickCommandExecute = test.mock.method(clickCommand, 'execute', () => {
          throw new Error('error')
        })

        const errorCommandExecute = test.mock.method(errorCommand, 'execute')

        buttonElement.commander.execute('click')
        test.assert.equal(consoleError.mock.callCount(), 1)
        test.assert.equal(clickCommandExecute.mock.callCount(), 1)
        test.assert.equal(errorCommandExecute.mock.callCount(), 1)
      }
    }
  })
})
