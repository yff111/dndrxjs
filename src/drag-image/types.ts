export interface DragImageMiddlewareOptions {
  updateContainerStyle: (element: HTMLElement, top: number, left: number) => any
  updateElement: (selectedElements: HTMLElement[]) => HTMLElement
  minElements: number
}
