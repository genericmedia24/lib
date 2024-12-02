import 'global-jsdom/register'
import { describe, it } from 'node:test'
import type { UpdatableElement } from '../../src/commander/updatable-element.js'
import { ElementUpdateCommand } from '../../src/commands/element-update.js'
import { defineElements } from '../../src/elements/define.js'
import { Element } from '../../src/elements/element.js'

describe('ElementUpdateCommand', () => {
  class CustomElement extends Element implements UpdatableElement {
    public override checkVisibility(): boolean {
      return true
    }

    public update(): void {}
  }

  defineElements({
    CustomElement,
  })

  it('should update immediately', (test) => {
    const element = new CustomElement()
    const command = new ElementUpdateCommand(element, element)

    const elementUpdate = test.mock.method(element, 'update')

    command.execute()

    test.assert.equal(elementUpdate.mock.callCount(), 1)
  })

  it('should update immediately and reject', async (test) => {
    const element = new CustomElement()

    test.mock.method(element, 'update', () => {
      throw new Error('update error')
    })

    const command = new ElementUpdateCommand(element, element)

    await test.assert.rejects(async () => {
      await command.execute()
    })
  })

  it('should not update immediately', async (test) => {
    const element = new CustomElement()

    const command = new ElementUpdateCommand(element, element, {
      immediate: 'false',
    })

    const elementUpdate = test.mock.method(element, 'update')

    command.execute()

    test.assert.equal(elementUpdate.mock.callCount(), 0)

    await new Promise((resolve) => {
      window.requestAnimationFrame(resolve)
    })

    test.assert.equal(elementUpdate.mock.callCount(), 1)
  })

  it('should not update immediately and reject', async (test) => {
    const element = new CustomElement()

    test.mock.method(element, 'update', () => {
      throw new Error('update error')
    })

    const command = new ElementUpdateCommand(element, element, {
      immediate: 'false',
    })

    await test.assert.rejects(async () => {
      await command.execute()
    })
  })

  it('should check visibility', (test) => {
    const element = new CustomElement()
    const elementUpdate = test.mock.method(element, 'update')

    test.mock.method(element, 'checkVisibility', () => {
      return false
    })

    const command = new ElementUpdateCommand(element, element, {
      'when-visible': 'true',
    })

    command.execute()

    test.assert.equal(elementUpdate.mock.callCount(), 0)
  })

  it('should merge data and options', (test) => {
    const element = new CustomElement()
    const elementUpdate = test.mock.method(element, 'update')

    const command = new ElementUpdateCommand(element, element, {
      'option-key': 'option-value',
    })

    command.execute({
      'data-key': 'data-value',
    })

    test.assert.equal(elementUpdate.mock.callCount(), 1)

    test.assert.deepEqual(elementUpdate.mock.calls.at(0)?.arguments, [
      {
        'data-key': 'data-value',
        'option-key': 'option-value',
      },
    ])
  })
})
