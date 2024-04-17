export type DropPosition = "before" | "after" | "in" | "none"
export type DropPositionRules = DropPosition | "around" | "all" | "notAfter"
export type DropPositionFn = (payload: {
  dragElement: Element
  dropElement: Element
}) => DropPositionRules
export type OnDropFn = (e: DragDropHookPayload) => void

export type Rect = { x: number; y: number; width: number; height: number }

export type GetSelectedElementsFn = () => HTMLElement[]
export type GetElementIdFn = (element: HTMLElement) => string
export type OnDragStartFn = (dragElement: HTMLElement) => any
export type OnBeforeDragStartFn = (dragElement: HTMLElement) => boolean
export type DragDropOptions = {
  targetSelector?: string
  containerSelector?: string
  handleSelector?: string
  // A function that returns the allowed drop positions that are allowed for a potential drop element.
  dropPositionFn?: DropPositionFn
  // A function that returns all selected item ids in a multiselect situation.
  getSelectedElements?: GetSelectedElementsFn
  getElementId?: GetElementIdFn
  vertical?: boolean
  dragOverThrottle?: number
  ignoreSelectors?: string
  /**
   * If enabled getBoundingClientRect() call on dropElements will be cached for each drag operation.
   */
  enableRectCaching?: boolean
  onDrop: OnDropFn
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
  onDragEnterContainer?: (payload: DragDropHookPayload) => void
  onDragLeaveContainer?: (payload: DragDropHookPayload) => void
  onDrop?: (payload: DragDropHookPayload) => void
  onDestroy?: () => void
}
export type DragDropMiddlewareFn<T> = (options?: T) => DragDropMiddleware
export type DragDropMiddleware = (
  state: {
    vertical: boolean
    container: HTMLElement
    scrollContainer: HTMLElement | Window
    getRectCached: GetRectFn
    getElementId: GetElementIdFn
  },
  options: DragDropOptions,
) => DragDropMiddlewareReturn

export type GetRectFn = (
  element: HTMLElement,
  getElementId?: GetElementIdFn,
) => Rect
