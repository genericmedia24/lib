import { DialogElement } from './element.js'

export interface AlertOptions {
  confirmText: string
  id: string
}

export interface ConfirmOptions {
  confirmText: string
  dismissText: string
  id: string
}

export interface DialogOptions {
  fullscreen?: boolean
  handleEvents?: string
  id: string
}

export async function alert(message: string, options?: Partial<AlertOptions>): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement(DialogElement.name)

    if (element instanceof DialogElement) {
      element.innerHTML = `
        <div>${message}</div>
        <button type="button" slot="footer-confirm">${options?.confirmText ?? 'OK'}</button>
      `

      element.handleEvents = 'confirm dismiss escape'
      element.id = options?.id ?? ''
      document.body.append(element)

      element.dialog.dialogElement?.addEventListener('close', () => {
        resolve()
        element.remove()
      })

      element.dialog.open()
    } else {
      reject(new Error('Alert could not be created'))
    }
  })
}

export async function confirm(message: string, options?: Partial<ConfirmOptions>): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const element = document.createElement(DialogElement.name)

    if (element instanceof DialogElement) {
      element.innerHTML = `
        <div>${message}</div>
        <button type="button" slot="footer-dismiss">${options?.dismissText ?? 'Cancel'}</button>
        <button type="button" slot="footer-confirm">${options?.confirmText ?? 'OK'}</button>
      `

      element.handleEvents = 'confirm dismiss escape'
      element.id = options?.id ?? ''
      document.body.append(element)

      element.dialog.dialogElement?.addEventListener('close', () => {
        resolve(element.dialog.dialogElement?.returnValue === 'confirm')
        element.remove()
      })

      element.dialog.open()
    } else {
      reject(new Error('Confirm could not be created'))
    }
  })
}

export function dialog(body: string, options?: Partial<DialogOptions>): DialogElement {
  const element = document.createElement(DialogElement.name)

  if (element instanceof DialogElement) {
    element.innerHTML = body
    element.fullscreen = options?.fullscreen ?? false
    element.handleEvents = options?.handleEvents ?? null
    element.id = options?.id ?? ''
    document.body.append(element)

    element.dialog.dialogElement?.addEventListener('close', () => {
      element.remove()
    })

    element.dialog.open()

    return element
  }

  throw new Error('Dialog could not be created')
}
