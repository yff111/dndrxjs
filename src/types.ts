export type DropPosition = "before" | "after" | "in" | "none"
export type DropPositionRules = DropPosition | "around" | "all" | "notAfter"
export type DropPositionFn = (payload: {
  dragElement: Element
  dropElement: Element
}) => DropPositionRules
export type OnDragEndFn = (e: DragDropPayload) => void
export type DragDropPayload = {
  dragElement: HTMLElement
  dropElement: HTMLElement
  selectedElements: HTMLElement[]
  position: DropPosition
}

export type Rect = { x: number; y: number; width: number; height: number }

export type GetSelectedElementsFn = () => HTMLElement[]
export type GetElementIdFn = (element: HTMLElement) => string
export type OnDragStartFn = (dragElement: HTMLElement) => any
export type OnBeforeDragStartFn = (dragElement: HTMLElement) => boolean
export type DragDropOptions = {
  targetSelector?: string
  handleSelector?: string
  // A function that returns the allowed drop positions that are allowed for a potential drop element.
  dropPositionFn?: DropPositionFn
  // A function that returns all selected item ids in a multiselect situation.
  getSelectedElements?: GetSelectedElementsFn
  getElementId?: GetElementIdFn
  vertical?: boolean
  dragOverThrottle?: number
  ignoreSelectors?: string
  onDrop: OnDragEndFn
  onDragStart?: OnDragStartFn
  onBeforeDragStart?: OnBeforeDragStartFn
}

export type DragDropHookPayload = {
  dragElement: HTMLElement
  dropElement?: HTMLElement
  scrollContainer?: HTMLElement | Window
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
  getElementId: GetElementIdFn
}) => DragDropMiddlewareReturn

export type GetRectFn = (
  element: HTMLElement,
  getElementId?: GetElementIdFn,
) => Rect
