import type {
  DragDropEventType,
  DragDropOptions,
  DragDropPayload,
  DropPosition,
  DropPositionRules,
} from './types'
import { fromEvent, merge, of } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  take,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators'
import {
  flushRectCache,
  getClosestScrollContainer,
  getRectCached,
  setAttributesTo,
} from './utils'

/**
 *  Returns a map of functions that returns the position for the given allowed positions.
 * @param allowedPositions
 * @param threshold
 */
export function calcPosition(allowedPositions: DropPositionRules, threshold: number = 0.3) {
  return (
    ({
      all: (offset: number, widthOrHeight: number) => {
        return offset < widthOrHeight * threshold
          ? 'before'
          : offset > widthOrHeight * (1 - threshold)
            ? 'after'
            : 'in'
      },
      notAfter: (offset: number, widthOrHeight: number) =>
        offset < widthOrHeight * threshold ? 'before' : 'in',
      around: (offset: number, widthOrHeight: number) =>
        offset < widthOrHeight / 2 ? 'before' : 'after',
      none: () => 'none',
      in: () => 'in',
      before: () => 'before',
      after: () => 'after',
    }) as Record<
      DropPositionRules,
      (offset?: number, widthOrHeight?: number) => DropPosition
    >
  )[allowedPositions]
}

export const DEFAULTS: DragDropOptions = {
  container: document.body,
  dragElementSelector: '[data-id]',
  dropElementSelector: '[data-id]',
  handleSelector: '[data-id]', // use target selector when no handle selector was provided
  getElementId: (el: HTMLElement) => el.getAttribute('data-id') as string,
  dropPositionFn: () => 'around',
  vertical: true,
  dragOverThrottle: 20,
  threshold: 0.3,
  enableRectCaching: false,
  createStyleNode: (
    dropElementSelector: string,
    dragElementSelector: string,
    handleSelector: string,
  ) =>
    `${dropElementSelector}:not(tr) * { pointer-events: none;} tr${dropElementSelector} td * { pointer-events: none;}  ${dropElementSelector}, ${dragElementSelector}, ${handleSelector} {pointer-events: all!important;}`,
  onBeforeDragStart: (el: HTMLElement) =>
    !el.closest('button:not([data-id]), a:not([data-id]), input, textarea'),
}

export function createDragDropObservable(options?: Partial<DragDropOptions>) {
  const optionsExtended = options
    ? { ...DEFAULTS, ...options }
    : { ...DEFAULTS }
  if (!optionsExtended.handleSelector) {
    optionsExtended.handleSelector = optionsExtended.dragElementSelector
  }

  const {
    container,
    vertical,
    getElementId,
    dropPositionFn,
    onBeforeDragStart,
    dragOverThrottle,
    handleSelector,
    dragElementSelector,
    threshold,
    getSelectedElements,
    dropElementSelector,
    createStyleNode,
  } = optionsExtended

  const property = vertical ? 'offsetY' : ('offsetX' as keyof DragEvent)
  let currentPayload: DragDropPayload

  /**
   * removes pointer-events on children of drop-targets so offsetY and offsetX
   * in dragover event will be absolute
   */
  const styleNode = document.createElement('style')
  styleNode.textContent = createStyleNode(
    dropElementSelector,
    dragElementSelector,
    handleSelector,
  )

  const getCombinedSelectedElements = (currentElement: HTMLElement) =>
    getSelectedElements
      ? [currentElement].reduce((acc, item) => {
          const selectedElements = getSelectedElements()
          return selectedElements.includes(item)
            ? selectedElements
            : [...selectedElements, item]
        }, [] as HTMLElement[])
      : [currentElement]

  const calcPositionLocal = vertical
    ? (dropElement: HTMLElement, dragElement: HTMLElement, offset: number) =>
        calcPosition(
          dragElement !== dropElement
            ? dropPositionFn({ dropElement, dragElement })
            : 'none',
          threshold,
        )(offset, getRectCached(dropElement, getElementId, container).height)
    : (dropElement: HTMLElement, dragElement: HTMLElement, offset: number) =>
        calcPosition(
          dragElement !== dropElement
            ? dropPositionFn({ dropElement, dragElement })
            : 'none',
          threshold,
        )(offset, getRectCached(dropElement, getElementId, container).width)

  const createPayload = (
    type: DragDropEventType,
    originalEvent: DragEvent | MouseEvent,
    dragElements: HTMLElement[],
    scrollContainer: HTMLElement | Window,
    dropElement?: HTMLElement,
    position?: DropPosition,
  ) =>
    ({
      type,
      originalEvent,
      dropElement,
      dragElements,
      scrollContainer,
      position,
      options: optionsExtended,
      container,
    }) as DragDropPayload

  /**
   * Mousedown
   */
  const mousedown$ = fromEvent<MouseEvent>(container, 'mousedown').pipe(
    filter(
      (e: MouseEvent) =>
        e.target instanceof HTMLElement
        && (onBeforeDragStart ? onBeforeDragStart(e.target) : true)
        && !!e.target.closest(handleSelector),
    ),
    map(
      (e: MouseEvent) =>
        [
          e,
          (e.target as HTMLElement)?.closest(handleSelector),
          (e.target as HTMLElement)?.closest(dragElementSelector),
        ] as [MouseEvent, HTMLElement, HTMLElement],
    ),
    // don't proceed if there are neither handle- nor drag-elements
    filter(
      ([, handleElement, dragElement]) => !!handleElement && !!dragElement,
    ),
    map(([e, , dragElement]) => {
      dragElement.setAttribute('draggable', 'true')
      // in case no drag events will be called
      fromEvent<MouseEvent>(document, 'mouseup')
        .pipe(take(1))
        .subscribe(() =>
          setAttributesTo(dragElementSelector, 'draggable', 'false', container),
        )
      return createPayload(
        'BeforeDragStart',
        e,
        getCombinedSelectedElements(dragElement),
        getClosestScrollContainer(dragElement),
      )
    }),
  )

  /**
   * DragStart
   */
  const dragStart$ = fromEvent<DragEvent>(container, 'dragstart').pipe(
    map(
      (e: DragEvent) =>
        [e, (e.target as HTMLElement).closest?.(dragElementSelector)] as [
          DragEvent,
          HTMLElement,
        ],
    ),
    // do not proceed if dragElementSelector does not in target element
    filter(([, dragElement]) => !!dragElement),
    // add style node
    tap(() => document.head.appendChild(styleNode)),
    map(([event, dragElement]) => {
      if (window.getSelection()?.type === 'Range') {
        event.preventDefault()
        document.getSelection()?.empty()
      }
      event.dataTransfer!.effectAllowed = 'move'
      event.dataTransfer!.dropEffect = 'move'

      flushRectCache()

      return createPayload(
        'DragStart',
        event,
        getCombinedSelectedElements(dragElement),
        getClosestScrollContainer(dragElement),
      )
    }),
  )

  /**
   * DragOver
   */
  const dragOver$ = fromEvent<DragEvent>(document.body, 'dragover').pipe(
    // prevents drag end animation
    tap((dragEvent: DragEvent) => dragEvent.preventDefault()),
    // add dragOver event throttling
    dragOverThrottle ? throttleTime(dragOverThrottle) : tap(),
    map(
      (dragEvent: DragEvent) =>
        [
          dragEvent[property],
          (dragEvent.target as HTMLElement)?.closest?.(
            dropElementSelector,
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
        currentPayload.dragElements[0],
        offset,
      ),
      dropElement: dropElement!,
      dragEvent,
    })),
    distinctUntilChanged(
      (e, e2) => e.position === e2.position && e.dropElement === e2.dropElement,
    ),
    filter(
      ({ dropElement, position }) =>
        // abort when drop element not in container
        // abort when not dragging over element
        position !== 'none' && container.contains(dropElement),
    ),
    map(({ dropElement, position, dragEvent }) =>
      createPayload(
        'DragOver',
        dragEvent,
        currentPayload.dragElements,
        getClosestScrollContainer(dropElement),
        dropElement,
        position,
      ),
    ),
  )

  /**
   * DragEnd
   */
  const dragEnd$ = merge(
    fromEvent<DragEvent>(document.body, 'dragend'),
    fromEvent<MouseEvent>(document.body, 'mouseup'),
  ).pipe(
    tap((e: DragEvent | MouseEvent) => {
      e.preventDefault()
      // @TODO: this does not work in FF
      // if (e.dataTransfer?.dropEffect === "none") {
      //   currentDropElement = null
      // }
      // clean up
      styleNode.remove()
      setAttributesTo(dragElementSelector, 'draggable', 'false')
    }),
    map((e: DragEvent | MouseEvent) =>
      createPayload(
        'DragEnd',
        e,
        currentPayload.dragElements,
        currentPayload.container,
        currentPayload.dropElement,
        currentPayload.position,
      ),
    ),
  )

  /**
   * Bringing it all together
   */
  return mousedown$.pipe(
    mergeMap(mousedown =>
      merge(
        of(mousedown), // merge mousedown event to stream
        dragStart$.pipe(take(1)),
        dragOver$.pipe(takeUntil(dragEnd$)),
        dragEnd$.pipe(take(1)),
      ),
    ),

    // store payload
    tap(payload => (currentPayload = payload)),
  )
}

export default createDragDropObservable
