export interface Delegate {
  connect?: (element: HTMLElement) => void
  disconnect?: (element: HTMLElement) => void
}
