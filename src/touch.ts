import type { DragDropEventType, DragDropOptions, DragDropPayload, DropPosition } from './types'
import { Observable, fromEvent, merge, of } from 'rxjs'
import {
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'
import createDragDropObservable, { DEFAULTS } from './main'
import {
  calcPosition,
  flushRectCache,
  getClosestScrollContainer,
  resolveSelectedElements,
} from './utils'

const DRAG_THRESHOLD = 5

export function createTouchDragDropObservable(options: Partial<DragDropOptions> = {}) {
  const opts: DragDropOptions = { ...DEFAULTS, createStyleNode: () => '', ...options }
  if (!opts.handleSelector) {
    opts.handleSelector = opts.dragElementSelector
  }

  const {
    container,
    vertical,
    dropPositionFn,
    onBeforeDragStart,
    dragOverThrottle,
    handleSelector,
    dragElementSelector,
    threshold,
    getSelectedElements,
    dropElementSelector,
  } = opts

  let currentPayload: DragDropPayload

  const createPayload = (
    type: DragDropEventType,
    originalEvent: TouchEvent,
    dragElements: HTMLElement[],
    scrollContainer: HTMLElement | Window,
    dropElement?: HTMLElement,
    position?: DropPosition,
  ): DragDropPayload => ({
    type,
    originalEvent,
    dropElement,
    dragElements,
    scrollContainer,
    position,
    options: opts,
    container,
  })

  return fromEvent<TouchEvent>(container, 'touchstart', { passive: false }).pipe(
    map((e) => {
      const target = e.target as HTMLElement
      return [
        e,
        target?.closest<HTMLElement>(handleSelector),
        target?.closest<HTMLElement>(dragElementSelector),
      ] as [TouchEvent, HTMLElement | null, HTMLElement | null]
    }),
    filter(([e, handleEl, dragEl]) =>
      !!handleEl
      && !!dragEl
      && (onBeforeDragStart ? onBeforeDragStart(e.target as HTMLElement) : true),
    ),
    switchMap(([startEvent, , dragElement]) => {
      const touch0 = startEvent.touches[0]
      const startX = touch0.clientX
      const startY = touch0.clientY
      const rect = dragElement!.getBoundingClientRect()
      const offsetX = startX - rect.left
      const offsetY = startY - rect.top
      const dragElements = resolveSelectedElements(dragElement!, getSelectedElements)
      const scrollContainer = getClosestScrollContainer(dragElement!)

      let ghost: HTMLElement | null = null
      let dragStarted = false
      let lastDropEl: HTMLElement | undefined
      let lastPos: DropPosition | undefined

      const touchend$ = fromEvent<TouchEvent>(document, 'touchend').pipe(take(1))

      /**
       * Imperative touchmove handler: waits for DRAG_THRESHOLD before committing,
       * then prevents scroll and emits DragStart / DragOver payloads.
       * Using new Observable for precise control over addEventListener options.
       */
      const touchmove$ = new Observable<DragDropPayload>((subscriber) => {
        let throttleTimer: ReturnType<typeof setTimeout> | undefined

        const onMove = (e: TouchEvent) => {
          const t = e.touches[0]

          // ── Phase 1: waiting for threshold ──────────────────────────────────
          if (!dragStarted) {
            if (Math.hypot(t.clientX - startX, t.clientY - startY) <= DRAG_THRESHOLD) {
              return // allow native scroll
            }
            dragStarted = true
            e.preventDefault()

            ghost = dragElement!.cloneNode(true) as HTMLElement
            ghost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;opacity:0.75;margin:0;box-sizing:border-box;`
            document.body.appendChild(ghost)
            flushRectCache()
            ghost.style.top = `${t.clientY - offsetY}px`
            ghost.style.left = `${t.clientX - offsetX}px`

            subscriber.next(createPayload('DragStart', e, dragElements, scrollContainer))
            return
          }

          // ── Phase 2: drag committed ─────────────────────────────────────────
          e.preventDefault()

          // Throttle DragOver processing
          if (dragOverThrottle) {
            if (throttleTimer) {
              // Update ghost position even while throttled so it feels smooth
              ghost!.style.top = `${t.clientY - offsetY}px`
              ghost!.style.left = `${t.clientX - offsetX}px`
              return
            }
            throttleTimer = setTimeout(() => { throttleTimer = undefined }, dragOverThrottle)
          }

          ghost!.style.top = `${t.clientY - offsetY}px`
          ghost!.style.left = `${t.clientX - offsetX}px`

          const dropEl = document.elementFromPoint(t.clientX, t.clientY)
            ?.closest<HTMLElement>(dropElementSelector) ?? null
          if (!dropEl || !container.contains(dropEl)) return

          const { top, left, height, width } = dropEl.getBoundingClientRect()
          const offset = vertical ? t.clientY - top : t.clientX - left
          const dim = vertical ? height : width
          const posRules = dragElement !== dropEl
            ? dropPositionFn({ dropElement: dropEl, dragElement: dragElement! })
            : 'none' as const
          const position = calcPosition(posRules, threshold)(offset, dim)
          if (position === 'none') return
          if (position === lastPos && dropEl === lastDropEl) return // deduplicate

          lastPos = position
          lastDropEl = dropEl
          subscriber.next(
            createPayload('DragOver', e, dragElements, getClosestScrollContainer(dropEl), dropEl, position),
          )
        }

        document.addEventListener('touchmove', onMove, { passive: false })
        const endSub = touchend$.subscribe(() => {
          clearTimeout(throttleTimer)
          document.removeEventListener('touchmove', onMove)
          subscriber.complete()
        })

        return () => {
          clearTimeout(throttleTimer)
          document.removeEventListener('touchmove', onMove)
          endSub.unsubscribe()
        }
      })

      const end$ = touchend$.pipe(
        tap(() => ghost?.remove()),
        map(e =>
          createPayload(
            'DragEnd',
            e,
            dragElements,
            container,
            currentPayload?.dropElement,
            currentPayload?.position,
          ),
        ),
      )

      return merge(
        of(createPayload('BeforeDragStart', startEvent, dragElements, scrollContainer)),
        touchmove$,
        end$,
      )
    }),
    tap(payload => (currentPayload = payload)),
  )
}

/**
 * Merges the mouse/HTML5-DnD and touch streams into one observable that works
 * on desktop, mobile, and Chrome DevTools touch simulation.
 *
 * `touchstart` always fires before `mousedown` on hybrid/simulated devices, so
 * a shared flag is used to suppress the mouse stream whenever touch is active,
 * preventing duplicate BeforeDragStart/DragEnd events.
 */
export function createUniversalDragDropObservable(options: Partial<DragDropOptions> = {}) {
  let activeDragSource: 'mouse' | 'touch' | null = null

  const mouse$ = createDragDropObservable(options).pipe(
    filter(() => activeDragSource !== 'touch'),
    tap(({ type }) => {
      if (type === 'BeforeDragStart') activeDragSource = 'mouse'
      if (type === 'DragEnd') activeDragSource = null
    }),
  )

  const touch$ = createTouchDragDropObservable(options).pipe(
    tap(({ type }) => {
      if (type === 'BeforeDragStart') activeDragSource = 'touch'
      if (type === 'DragEnd') activeDragSource = null
    }),
  )

  return merge(touch$, mouse$)
}

export default createTouchDragDropObservable
