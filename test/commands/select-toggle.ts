import 'global-jsdom/register'
import { describe, it } from 'node:test'
import { SelectToggleCommand } from '../../src/commands/select-toggle.js'

describe('SelectToggleCommand', () => {
  it('should toggle hidden attribute of elements', (test) => {
    document.body.innerHTML = `
      <select id="toggle-select">
        <option>option-1</option>
        <option>option-2</option>
      </select>
      <div data-select-toggle="toggle-select" data-select-toggle-value="option-1" hidden></div>
      <div data-select-toggle="toggle-select" data-select-toggle-value="option-2" hidden></div>
    `

    const selectElement = document.querySelector('select')
    const divElements = document.querySelectorAll('div')

    if (selectElement !== null) {
      const command = new SelectToggleCommand(selectElement, selectElement)

      test.assert.equal(divElements.item(0).hasAttribute('hidden'), true)
      test.assert.equal(divElements.item(1).hasAttribute('hidden'), true)

      selectElement.value = 'option-1'
      command.execute()

      test.assert.equal(divElements.item(0).hasAttribute('hidden'), false)
      test.assert.equal(divElements.item(1).hasAttribute('hidden'), true)

      selectElement.value = 'option-2'
      command.execute()

      test.assert.equal(divElements.item(0).hasAttribute('hidden'), true)
      test.assert.equal(divElements.item(1).hasAttribute('hidden'), false)
    }
  })

  it('should toggle disabled attribute of inputs inside elements', (test) => {
    document.body.innerHTML = `
      <select id="toggle-select">
        <option>option-1</option>
        <option>option-2</option>
      </select>
      <div data-select-toggle="toggle-select" data-select-toggle-value="option-1" hidden>
        <input disabled>  
      </div>
      <div data-select-toggle="toggle-select" data-select-toggle-value="option-2" hidden>
        <input disabled>
      </div>
    `

    const selectElement = document.querySelector('select')
    const inputElements = document.querySelectorAll('input')

    if (selectElement !== null) {
      const command = new SelectToggleCommand(selectElement, selectElement)

      test.assert.equal(inputElements.item(0).hasAttribute('disabled'), true)
      test.assert.equal(inputElements.item(1).hasAttribute('disabled'), true)

      selectElement.value = 'option-1'
      command.execute()

      test.assert.equal(inputElements.item(0).hasAttribute('disabled'), false)
      test.assert.equal(inputElements.item(1).hasAttribute('disabled'), true)

      selectElement.value = 'option-2'
      command.execute()

      test.assert.equal(inputElements.item(0).hasAttribute('disabled'), true)
      test.assert.equal(inputElements.item(1).hasAttribute('disabled'), false)
    }
  })
})
