export interface DragDropOptions {
  /**
   * Container element where the draggable elements and drop targets are found.
   * Defaults to `document.body`.
   */
  container: HTMLElement
  /**
   * Selector for the draggable elements.
   * Defaults to `[data-id]`.
   */
  dragElementSelector: string
  /**
   * Selector for all elements that qualify as drop targets.
   * Defaults to `[data-id]`.
   */
  dropElementSelector: string
  /**
   * Selector within the drag element that qualifies as handle element.
   * Defaults to `[data-id]`.
   */
  handleSelector: string
  /**
   * A method that returns the allowed drop positions for a drop element.
   */
  dropPositionFn: DropPositionFn
  /**
   * A method that returns all selected elements in a multi-select situation.
   */
  getSelectedElements?: GetSelectedElementsFn
  /**
   * A method that retrieves the element's unique ID from the DOM element.
   * Defaults to: `(el: HTMLElement) => el.getAttribute("data-id")`
   */
  getElementId: GetElementIdFn
  /**
   * Should be `false` for grids or horizontal lists. Defaults to `true`.
   */
  vertical: boolean
  /**
   * Throttle interval for `dragover` events in milliseconds. Defaults to `20`.
   */
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
   * for each drag operation for better performance.
   * Defaults to `false`.
   */
  enableRectCaching: boolean
  /**
   * Guard called on mousedown/touchstart — return `false` to cancel the drag.
   * Defaults to blocking drags initiated on buttons, links, inputs, and textareas.
   */
  onBeforeDragStart: OnBeforeDragStartFn
  /**
   * Method to create style-tag contents added to the DOM during a drag operation.
   * Primarily sets pointer-events of drop element children to 'none' so the
   * dragover event reports offsets relative to the drop element itself.
   */
  createStyles: (
    dropElementSelector: string,
    dragElementSelector: string,
    handleSelector: string,
  ) => string

  /**
   * Snap ghost position (touch) and offset computation to a grid of this many pixels.
   * Defaults to `undefined` (no snapping).
   */
  snapToGrid?: number
  /**
   * Override the default threshold-based position calculation.
   * Receives `(rules, threshold)` and must return a function `(offset, size) => DropPosition`.
   * Defaults to the built-in `calcPosition`.
   */
  collisionDetection?: CollisionDetectionFn

  // ── Lifecycle callbacks ────────────────────────────────────────────────────

  /** Called when the drag begins (after the browser fires dragstart / touch threshold crossed). */
  onDragStart?: (payload: DragDropPayload) => void
  /** Called each time the drag position changes. */
  onDragOver?: (payload: DragDropPayload) => void
  /** Called when the drag ends (always fires, even after an abort). */
  onDragEnd?: (payload: DragDropPayload) => void
  /** Called when the drag is cancelled via Escape. Fires before `onDragEnd`. */
  onDragAbort?: (payload: DragDropPayload) => void

  // ── Plugins ───────────────────────────────────────────────────────────────

  /**
   * Optional list of plugins. Each plugin is an object with optional hooks for
   * each drag lifecycle phase. Plugins are called before the option callbacks above.
   */
  plugins?: DragDropPlugin[]
}

export type DropPosition = 'before' | 'after' | 'in' | 'none'
export type DropPositionRules = DropPosition | 'around' | 'all' | 'notAfter'
export type DragDropEventType
  = | 'BeforeDragStart'
    | 'DragStart'
    | 'DragOver'
    | 'DragEnd'
    | 'DragAbort'

export type GetSelectedElementsFn = () => HTMLElement[]
export type GetElementIdFn = (element: HTMLElement) => string
export type OnBeforeDragStartFn = (dragElement: HTMLElement) => boolean
export type DropPositionFn = (payload: {
  dragElement: Element
  dropElement: Element
}) => DropPositionRules
/**
 * Swappable collision detection algorithm. Receives the resolved position rules
 * and threshold, returns a function that maps (offset, elementSize) → DropPosition.
 * The default implementation is `calcPosition` from `./main`.
 */
export type CollisionDetectionFn = (
  rules: DropPositionRules,
  threshold: number,
) => (offset: number, size: number) => DropPosition

export interface DragDropPayload {
  type: DragDropEventType
  originalEvent: DragEvent | MouseEvent | TouchEvent | KeyboardEvent
  dragElements: HTMLElement[]
  container: HTMLElement | Window
  scrollContainer: HTMLElement | Window
  dropElement?: HTMLElement
  position?: DropPosition
  options: DragDropOptions
}

/**
 * A plugin is a plain object with optional hooks for each drag lifecycle phase.
 * Create one by calling a plugin factory (e.g. `autoScroll()`, `indicator()`).
 */
export type DragDropPlugin = Partial<Record<DragDropEventType, (payload: DragDropPayload) => void>>

/** Returned by `createDragDrop` and its variants. Call `destroy()` to remove all listeners. */
export interface DragDropInstance {
  destroy: () => void
}

/**
 * Rect
 */
export interface Rect { x: number, y: number, width: number, height: number }

export type GetRectFn = (
  element: HTMLElement,
  getElementId: GetElementIdFn,
  container: HTMLElement,
) => Rect
