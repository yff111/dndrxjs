export type DropPosition = "before" | "after" | "in" | "none"
export type DropPositionRules = DropPosition | "around" | "all" | "notAfter"
export type DropPositionFn = (payload: {
  target: Element
  from: Element
}) => DropPositionRules
export type OnDragEndFn = (e: DragDropPayload) => void
export type GetSelectedElementsFn = () => HTMLElement[]
export interface DragDropPayload {
  from: HTMLElement
  to: HTMLElement
  selectedElements: HTMLElement[]
  position: DropPosition
}

export type Rect = { x: number; y: number; width: number; height: number }

export type OnDragStartFn = (dragElement: HTMLElement) => any
export interface DragDropOptions {
  targetSelector?: string
  idAttribute?: string
  // The attribute name for the unique identifier that is required to be on each selector element.
  handleSelector?: string
  // A function that returns the allowed drop positions that are allowed for a potential drop element.
  dropPositionFn?: DropPositionFn
  // A function that returns all selected item ids in a multiselect situation.
  getSelectedElements?: GetSelectedElementsFn
  vertical?: boolean
  dragOverThrottle?: number
  ignoreSelectors?: string
  onDragEnd: OnDragEndFn
  onDragStart?: OnDragStartFn
}

export type DragDropHookPayload = {
  dragElement: HTMLElement
  dropElement?: HTMLElement
  selectedElements: HTMLElement[]
  position?: DropPosition
  event: DragEvent
}

export interface DragDropMiddlewareReturn {
  onDragStart?: (payload: DragDropHookPayload) => void
  onDragOver?: (payload: DragDropHookPayload) => void
  onDragEnd?: (payload: DragDropHookPayload) => void
  onDrop?: (payload: DragDropHookPayload) => void
  onDestroy?: () => void
}
export type DragDropMiddlewareFn<T> = (options?: T) => DragDropMiddleware
export type DragDropMiddleware = (state: {
  vertical: boolean
  container: HTMLElement
  scrollContainer: HTMLElement | Window
  getRectCached: GetRectFn
  idAttribute: string
}) => DragDropMiddlewareReturn

export type GetRectFn = (element: Element, idAttributeLocal?: string) => Rect
