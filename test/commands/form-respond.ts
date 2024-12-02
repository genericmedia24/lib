import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { FormRespondCommand } from '../../src/commands/form-respond.js'
import { defineElements } from '../../src/elements/define.js'
import { FormElement } from '../../src/elements/form.js'
import { elements } from '../../src/elements/index.js'

describe('FormRespondCommand', () => {
  defineElements(elements)

  it('should execute commands from response', async (test) => {
    const formElement = new FormElement()
    const command = new FormRespondCommand(formElement, formElement)
    const commanderExecuteAll = test.mock.method(formElement.commander, 'executeAll')

    await command.execute({
      response: new Response(JSON.stringify([
        {
          data: {
            key: 'value',
          },
          event: 'ok',
        },
      ]), {
        headers: {
          'content-type': 'application/json',
        },
      }),
    })

    test.assert.equal(commanderExecuteAll.mock.callCount(), 1)

    test.assert.deepEqual(commanderExecuteAll.mock.calls.at(0)?.arguments.at(0), [
      {
        data: {
          key: 'value',
        },
        event: 'ok',
      },
    ])
  })
})
