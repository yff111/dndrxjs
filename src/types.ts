import { Observable } from "rxjs"

export type DropPosition = "before" | "after" | "in" | "none"
export type DropPositionRules = DropPosition | "around" | "all" | "notAfter"
export type DropPositionFn = (payload: {
  dragElement: Element
  dropElement: Element
}) => DropPositionRules

export type Rect = { x: number; y: number; width: number; height: number }

export type GetSelectedElementsFn = () => HTMLElement[]
export type GetElementIdFn = (element: HTMLElement) => string
export type OnDragStartFn = (dragElement: HTMLElement) => any
export type OnBeforeDragStartFn = (dragElement: HTMLElement) => boolean
export type DragDropOptions = {
  /**
   * Container element where the draggable elements and drop targets are found. Defaults to document body.
   */
  container: HTMLElement
  dragElementSelector: string
  dropElementSelector: string
  handleSelector?: string
  // A function that returns the allowed drop positions that are allowed for a potential drop element.
  dropPositionFn: DropPositionFn
  // A function that returns all selected item ids in a multiselect situation.
  getSelectedElements?: GetSelectedElementsFn
  getElementId: GetElementIdFn
  vertical?: boolean
  dragOverThrottle: number
  threshold: number
  ignoreSelectors?: string
  /**
   * If enabled getBoundingClientRect() call on dropElements will be cached for each drag operation.
   */
  enableRectCaching?: boolean
  onBeforeDragStart?: OnBeforeDragStartFn
}

export type DragDropOptionsOptional = Partial<DragDropOptions>

export type DragDropMiddlewareOperator<T = any> = (
  options: T,
) => (source: Observable<DragDropPayload>) => Observable<DragDropPayload>

export type DragDropEventType =
  | "BeforeDragStart"
  | "DragStart"
  | "DragOver"
  | "DragEnd"
  | "DragAbort"

export type DragDropPayload = {
  type: DragDropEventType
  originalEvent: DragEvent | MouseEvent
  dragElements: HTMLElement[]
  container: HTMLElement | Window
  scrollContainer: HTMLElement | Window
  dropElement?: HTMLElement
  position?: DropPosition
  previous?: DragDropPayload
  options: DragDropOptions
}

export type DragDropMiddlewareHookMap = Record<DragDropEventType, () => any>

export type GetRectFn = (
  element: HTMLElement,
  getElementId: GetElementIdFn,
  container: HTMLElement,
) => Rect
