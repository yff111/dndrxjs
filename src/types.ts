export type DragDropOptions = {
  /**
   * Container element where the draggable elements and drop targets are found.
   * Defaults to `document.body`.
   */
  container: HTMLElement
  /**
   * Selector of the elements should be dragged.
   * Defaults to `[data-id]`.
   */
  dragElementSelector: string
  /**
   * Selector of the elements that can serve as drop targets.
   * Defaults to `[data-id]`.
   */
  dropElementSelector: string
  /**
   * Selector within the drag element that should serve as handle element.
   * Also defaults to `[data-id]`.
   */
  handleSelector: string
  /**
   * A method that returns the allowed drop positions that are allowed for a
   * potential drop element.
   */
  dropPositionFn: DropPositionFn
  // A method that returns all selected item ids in a multiselect situation.
  getSelectedElements?: GetSelectedElementsFn
  /**
   * A method that retrieves the elements id from the DOM-Element.
   * Defaults to: `(el: HTMLElement) => el.getAttribute("data-id")`
   */
  getElementId: GetElementIdFn
  // Should be false for grids or horizontal lists. Defaults to true.
  vertical: boolean
  // Throttle timeout for `dragover` events. Defaults to 30ms.
  dragOverThrottle: number
  /**
   * The percentage offset of the elements outer edges for determining whether
   * the drop position should be `before`, `in` or `after`. Only relevant when
   * the allowed `DropPosition` is `all`.
   * Defaults to 0.3.
   */
  threshold: number
  /**
   * If enabled getBoundingClientRect() call on dropElements will be cached
   * for each drag operation.
   */
  enableRectCaching: boolean
  /**
   * Method that is called on mousedown and should return a boolean that
   * indicates whether the Drag & Drop operation should proceed.
   */
  onBeforeDragStart?: OnBeforeDragStartFn
}

export type DropPosition = "before" | "after" | "in" | "none"
export type DropPositionRules = DropPosition | "around" | "all" | "notAfter"
export type DragDropEventType =
  | "BeforeDragStart"
  | "DragStart"
  | "DragOver"
  | "DragEnd"
  | "DragAbort"

export type GetSelectedElementsFn = () => HTMLElement[]
export type GetElementIdFn = (element: HTMLElement) => string
export type OnDragStartFn = (dragElement: HTMLElement) => any
export type OnBeforeDragStartFn = (dragElement: HTMLElement) => boolean
export type DropPositionFn = (payload: {
  dragElement: Element
  dropElement: Element
}) => DropPositionRules

export type DragDropPayload = {
  type: DragDropEventType
  originalEvent: DragEvent | MouseEvent
  dragElements: HTMLElement[]
  container: HTMLElement | Window
  scrollContainer: HTMLElement | Window
  dropElement?: HTMLElement
  position?: DropPosition
  options: DragDropOptions
}

/**
 * Middleware
 */

import { Observable } from "rxjs"
export type DragDropMiddlewareOperator<T = undefined> = (
  options?: Partial<T>,
) => (source: Observable<DragDropPayload>) => Observable<DragDropPayload>

export type DragDropMiddlewareHookMap = Record<DragDropEventType, () => any>

/**
 * Rect
 */

export type Rect = { x: number; y: number; width: number; height: number }

export type GetRectFn = (
  element: HTMLElement,
  getElementId: GetElementIdFn,
  container: HTMLElement,
) => Rect
