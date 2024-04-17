import { fromEvent, EMPTY, Subscription } from "rxjs"
import {
  map,
  filter,
  distinctUntilChanged,
  mergeMap,
  takeUntil,
  throttleTime,
  take,
  tap,
} from "rxjs/operators"
import { getScrollX, getScrollY, getClosestScrollContainer } from "./helpers"
import {
  DropPositionRules,
  DropPosition,
  DragDropMiddleware,
  GetRectFn,
  DragDropOptions,
  GetElementIdFn,
  DragDropMiddlewareReturn,
  DragDropHookPayload,
  Rect,
} from "./types"

/**
 *  Returns a map of functions that returns the position for the given allowed positions.
 * @param allowedPositions
 * @param threshold
 * @returns
 */
export const calcPosition = (
  allowedPositions: DropPositionRules,
  threshold: number = 0.3,
) =>
  (
    ({
      all: (offset: number, widthOrHeight: number) => {
        return offset < widthOrHeight * threshold
          ? "before"
          : offset > widthOrHeight * (1 - threshold)
            ? "after"
            : "in"
      },
      notAfter: (offset: number, widthOrHeight: number) =>
        offset < widthOrHeight * threshold ? "before" : "in",
      around: (offset: number, widthOrHeight: number) =>
        offset < widthOrHeight / 2 ? "before" : "after",
      none: () => "none",
      in: () => "in",
      before: () => "before",
      after: () => "after",
    }) as Record<
      DropPositionRules,
      (offset?: number, widthOrHeight?: number) => DropPosition
    >
  )[allowedPositions]

export const useDragDrop = (
  container: HTMLElement,
  options: DragDropOptions,
  middleware: DragDropMiddleware[] = [],
) => {
  const {
    // containerSelector,
    targetSelector = "[data-id]",
    // use target selector when no handle selector was provided
    handleSelector = "[data-id]" || options.targetSelector,
    dropPositionFn = () => "around",
    getSelectedElements,
    getElementId = (el: HTMLElement) => el.getAttribute("data-id") as string,
    vertical = true,
    dragOverThrottle = 20,
    onDrop,
    onDragStart,
    onBeforeDragStart = (el: HTMLElement) =>
      !el.closest("button:not([data-id]), a:not([data-id]), input, textarea"),
  } = options

  const setAttributesTo = (
    selector: string,
    attribute: string,
    value: string,
    parent: HTMLElement = container,
  ) =>
    parent
      .querySelectorAll(selector)
      .forEach((e: Element) => e.setAttribute(attribute, value))

  const mousedown$ = fromEvent<MouseEvent>(container, "mousedown")
  const mouseDownSubscription = mousedown$.subscribe((e: MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      onBeforeDragStart(e.target) &&
      e.target.closest(handleSelector)
    ) {
      e.target.closest(targetSelector)?.setAttribute("draggable", "true")
      fromEvent<MouseEvent>(document, "mouseup")
        .pipe(take(1))
        .subscribe(() => setAttributesTo(targetSelector, "draggable", "false"))
    }
  })

  const dragStart$ = fromEvent<DragEvent>(container, "dragstart")
  const dragOver$ = fromEvent<DragEvent>(document.body, "dragover")
  const dragEnd$ = fromEvent<DragEvent>(document.body, "dragend")

  let currentDropElement: HTMLElement | null = null
  let currentDragElement: HTMLElement | null = null
  let selectedElements: HTMLElement[] = []
  let scrollContainer: HTMLElement | Window =
    getClosestScrollContainer(container)
  let boundingRectCache: Record<
    string,
    { width: number; height: number; x: number; y: number }
  > = {}

  const getRelativeRect = (element: HTMLElement) => {
    const { width, height, x, y } = element.getBoundingClientRect()
    return {
      width,
      height,
      x: x + getScrollX(scrollContainer),
      y: y + getScrollY(scrollContainer),
    } as Rect
  }
  const getRectCached: GetRectFn = (
    element: HTMLElement,
    getElementIdLocal: GetElementIdFn = getElementId,
  ) => {
    const id = getElementIdLocal(element)
    return !options.enableRectCaching
      ? getRelativeRect(element)
      : boundingRectCache[id!] ||
          (boundingRectCache[id!] = getRelativeRect(element))
  }

  const calcPositionLocal = vertical
    ? (dropElement: HTMLElement, dragElement: HTMLElement, offset: number) =>
        calcPosition(
          dragElement !== dropElement
            ? dropPositionFn({ dropElement, dragElement })
            : "none",
        )(offset, getRectCached(dropElement).height)
    : (dropElement: HTMLElement, dragElement: HTMLElement, offset: number) =>
        calcPosition(
          dragElement !== dropElement
            ? dropPositionFn({ dropElement, dragElement })
            : "none",
        )(offset, getRectCached(dropElement).width)

  // returns 0 or element width or height
  // const getRelativeOffsetValue = vertical
  //   ? (evt: DragEvent, element: HTMLElement) =>
  //       evt.pageY < getRectCached(element).y ? 0 : getRectCached(element).height
  //   : (evt: DragEvent, element: HTMLElement) =>
  //       evt.pageX < getRectCached(element).x ? 0 : getRectCached(element).width

  // const getClosestElement = (evt: DragEvent, elements: HTMLElement[]) => {
  //   const closestElement =
  //     elements.length > 0 &&
  //     elements
  //       .map(
  //         (el) =>
  //           [
  //             el,
  //             getDistance(
  //               evt.pageX,
  //               evt.pageY,
  //               getRectCached(el).x,
  //               getRectCached(el).y,
  //             ),
  //           ] as [HTMLElement, number],
  //       )
  //       .sort((a, b) => a[1] - b[1])[0][0]

  //   return closestElement
  //     ? [getRelativeOffsetValue(evt, closestElement), closestElement, evt]
  //     : [0, null, evt]
  // }

  let dragOverSubscription: Subscription | null = null
  let dragEndSubscription: Subscription | null = null

  const middlewareReturns = middleware.map((m) =>
    m(
      { vertical, container, getRectCached, getElementId, scrollContainer },
      {
        targetSelector,
        handleSelector,
        dropPositionFn,
        getSelectedElements,
        getElementId,
        vertical,
        dragOverThrottle,
        onDrop,
        onDragStart,
        onBeforeDragStart,
      },
    ),
  )
  const createPayload = (event?: DragEvent) =>
    ({
      dragElement: currentDragElement!,
      dropElement: currentDropElement,
      selectedElements,
      scrollContainer,
      position,
      event,
    }) as DragDropHookPayload

  const callMiddleWareHook = (
    method: keyof DragDropMiddlewareReturn,
    e?: DragEvent,
    getPayload = createPayload,
  ) => middlewareReturns.forEach((m) => m[method]?.(getPayload(e)))

  const updateScrollContainer = () => {
    const newScrollContainer = getClosestScrollContainer(currentDropElement!)
    if (scrollContainer !== newScrollContainer) {
      callMiddleWareHook(
        "onDragEnterContainer",
        undefined,
        (e?: DragEvent) => ({
          ...createPayload(),
          scrollContainer: newScrollContainer,
        }),
      )
      // call onDragLeaveContainer with previous scrollContainer
      callMiddleWareHook("onDragLeaveContainer")
    }

    scrollContainer = newScrollContainer
  }
  const dragStartSubscription = dragStart$
    .pipe(
      mergeMap((e: DragEvent) => {
        e.dataTransfer!.effectAllowed = "move"
        e.dataTransfer!.dropEffect = "move"

        const target = e.target as HTMLElement
        // abort if text was selected
        if (window.getSelection()?.type === "Range") {
          e.preventDefault()
          document.getSelection()?.empty()
          return EMPTY
        }

        // abort when no matching selector not found in target
        if (!(currentDragElement = target.closest?.(targetSelector))) {
          return EMPTY
        }
        updateScrollContainer()

        // callback from option call
        onDragStart?.(currentDragElement)

        // subscribe to dragover- and dragend-events
        dragOverSubscription = subscribeToDragOverEvent()
        dragEndSubscription = subscribeToDragEndEvent()

        // flush rectangle cache
        boundingRectCache = {}

        selectedElements = getSelectedElements?.() || [currentDragElement]

        // call middleware hooks
        callMiddleWareHook("onDragStart", e)

        // start drag over subscription
        return dragOver$.pipe(takeUntil(dragEnd$))
      }),
    )
    .subscribe((e: DragEvent) => {})

  let property = vertical ? "offsetY" : ("offsetX" as keyof DragEvent)
  let position: DropPosition = "none"

  const subscribeToDragOverEvent = () =>
    dragOver$
      .pipe(
        // prevents drag end animation
        tap((dragEvent: DragEvent) => dragEvent.preventDefault()),
        dragOverThrottle ? throttleTime(dragOverThrottle) : tap(),
        map(
          (dragEvent: DragEvent) =>
            [
              dragEvent[property],
              (dragEvent.target as HTMLElement)?.closest?.(
                targetSelector,
              ) as HTMLElement,
              dragEvent,
            ] as [number, HTMLElement, DragEvent],
        ),
        // only proceed when offset has changed
        distinctUntilChanged(([offset], [offset2]) => offset === offset2),
        // only proceed when element exists (was found)
        filter(
          ([, dropElement]: [number, HTMLElement | null, DragEvent]) =>
            !!dropElement,
        ),
        // map to local position, ids etc.
        map(([offset, dropElement, dragEvent]) => ({
          position: calcPositionLocal(
            dropElement!,
            currentDragElement!,
            offset,
          ),
          dropElement: dropElement!,
          dragEvent,
        })),
        distinctUntilChanged(
          (e, e2) =>
            e.position === e2.position && e.dropElement === e2.dropElement,
        ),
      )
      .subscribe(
        (e: {
          position: DropPosition
          dropElement: HTMLElement
          dragEvent: DragEvent
        }) => {
          currentDropElement = e.dropElement as HTMLElement
          position = e.position

          // abort when drop element not in container
          if (!container.contains(currentDropElement)) {
            return
          }

          // abort when not dragging over element
          if (position === "none") {
            return
          }

          updateScrollContainer()

          // call middleware hooks
          callMiddleWareHook("onDragOver", e.dragEvent)
        },
      )

  const cleanUp = () => {
    dragOverSubscription?.unsubscribe?.()
    currentDropElement = null
    currentDragElement = null
    setAttributesTo(targetSelector, "draggable", "false")
  }

  const subscribeToDragEndEvent = () =>
    dragEnd$.pipe(take(1)).subscribe((e: DragEvent) => {
      // @TODO: this does not work in FF
      if (e.dataTransfer?.dropEffect === "none") {
        currentDropElement = null
      }
      e.preventDefault()
      // call middleware onDrop hooks
      callMiddleWareHook("onDrop", e)
      onDrop(createPayload(e))
      cleanUp()
    })

  const destroy = () => {
    dragStartSubscription?.unsubscribe()
    dragEndSubscription?.unsubscribe()
    dragOverSubscription?.unsubscribe()
    mouseDownSubscription?.unsubscribe()
    middlewareReturns.forEach((m) => m.onDestroy?.())
  }

  return { destroy }
}

export default useDragDrop
