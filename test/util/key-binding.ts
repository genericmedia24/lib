import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { KeyBinding } from '../../src/util/key-binding.js'

describe('KeyBinding', () => {
  it('should create singleton', (test) => {
    const keybinding1 = KeyBinding.create({
      key: 'enter',
    })

    const keybinding2 = KeyBinding.create({
      key: 'enter',
    })

    test.assert.equal(keybinding1, keybinding2)
  })

  it('should stringify key binding', (test) => {
    const string = KeyBinding.toString({
      altKey: true,
      ctrlKey: true,
      key: 'enter',
      shiftKey: true,
    })

    test.assert.equal(string, 'ctrl+shift+alt+enter')
  })

  it('should callback once after key is pressed', (test) => {
    const keybinding = new KeyBinding({
      altKey: true,
      ctrlKey: true,
      key: 'enter',
      shiftKey: true,
    })

    const callback = test.mock.fn(() => {
      keybinding.unregister(callback)
    })

    keybinding.start()
    keybinding.register(callback)

    window.dispatchEvent(new window.KeyboardEvent('keydown', {
      altKey: true,
      ctrlKey: true,
      key: 'enter',
      shiftKey: true,
    }))

    window.dispatchEvent(new window.KeyboardEvent('keydown', {
      altKey: true,
      ctrlKey: true,
      key: 'enter',
      shiftKey: true,
    }))

    keybinding.stop()
    test.assert.equal(callback.mock.callCount(), 1)
  })

  it('should handle meta key as ctrl key', (test) => {
    const keybinding = new KeyBinding({
      altKey: true,
      ctrlKey: true,
      key: 'enter',
      shiftKey: true,
    })

    const callback = test.mock.fn()

    keybinding.start()
    keybinding.register(callback)

    window.dispatchEvent(new window.KeyboardEvent('keydown', {
      altKey: true,
      key: 'enter',
      metaKey: true,
      shiftKey: true,
    }))

    keybinding.stop()
    test.assert.equal(callback.mock.callCount(), 1)
  })

  it('should stop listening for key events', (test) => {
    const keybinding = new KeyBinding({
      key: 'enter',
    })

    const callback = test.mock.fn()

    keybinding.start()
    keybinding.register(callback)
    keybinding.stop()

    window.dispatchEvent(new window.KeyboardEvent('keydown', {
      key: 'Enter',
    }))

    test.assert.equal(callback.mock.callCount(), 0)
  })
})
