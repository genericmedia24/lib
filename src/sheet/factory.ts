import { SheetElement } from './element.js'

export interface SheetOptions {
  handleEvents: string
  id: string
  initialInset: string
  maxInset: string
  modal: boolean
  moveThreshold: number
  placement: string
}

export function sheet(body: string, options?: Partial<SheetOptions>): SheetElement {
  const element = document.createElement(SheetElement.name)

  if (element instanceof SheetElement) {
    element.innerHTML = body
    element.handleEvents = options?.handleEvents ?? null
    element.id = options?.id ?? ''
    element.initialInset = options?.initialInset ?? null
    element.maxInset = options?.maxInset ?? null
    element.modal = options?.modal ?? false
    element.moveThreshold = options?.moveThreshold ?? null
    element.placement = options?.placement ?? null
    document.body.append(element)

    element.addEventListener('toggle', (event) => {
      if (event.newState === 'closed') {
        element.remove()
      }
    })

    element.sheet.open()

    return element
  }

  throw new Error('Sheet could not be created')
}
