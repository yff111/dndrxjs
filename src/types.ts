import { Observable } from "rxjs"

export type DragDropOptions = {
  /**
   * Container element where the draggable elements and drop targets are found. Defaults to document body.
   */
  container: HTMLElement
  // Selector of the elements should be dragged.
  dragElementSelector: string
  // Selector of the elements that can serve as drop targets.
  dropElementSelector: string
  // Selector within the drag element that should serve as handle element.
  handleSelector?: string
  // A function that returns the allowed drop positions that are allowed for a potential drop element.
  dropPositionFn: DropPositionFn
  // A function that returns all selected item ids in a multiselect situation.
  getSelectedElements?: GetSelectedElementsFn
  // A function that retrieves the elements id from the DOM-Element.
  getElementId: GetElementIdFn
  // Should be false for grids or horizontal lists. Defaults to true.
  vertical?: boolean
  // Throttle timeout for `dragover` events. Defaults to 30ms.
  dragOverThrottle?: number
  /**
   * The percentage offset of the elements outer edges for determining whether the drop position should be `before`,
   * `in` or `after`. Only relevant when the allowed `DropPosition` is `all`.
   * Defaults to 0.3.
   */
  threshold?: number
  /**
   * If enabled getBoundingClientRect() call on dropElements will be cached for each drag operation.
   */
  enableRectCaching?: boolean
  /**
   * Method that is called on mousedown and should return a boolean that indicates whether the
   * Drag & Drop operation should proceed.
   */
  onBeforeDragStart?: OnBeforeDragStartFn
}

export type DropPositionFn = (payload: {
  dragElement: Element
  dropElement: Element
}) => DropPositionRules

export type DragDropOptionsOptional = Partial<DragDropOptions>

export type DropPosition = "before" | "after" | "in" | "none"
export type DropPositionRules = DropPosition | "around" | "all" | "notAfter"

export type GetSelectedElementsFn = () => HTMLElement[]
export type GetElementIdFn = (element: HTMLElement) => string
export type OnDragStartFn = (dragElement: HTMLElement) => any
export type OnBeforeDragStartFn = (dragElement: HTMLElement) => boolean

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
export type Rect = { x: number; y: number; width: number; height: number }

export type GetRectFn = (
  element: HTMLElement,
  getElementId: GetElementIdFn,
  container: HTMLElement,
) => Rect
