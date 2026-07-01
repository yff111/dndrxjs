import type { DragDropInstance, DragDropOptions, DragDropPayload, DropPosition } from './types'
import createMouseDragDrop, { DEFAULTS, resolveOptions } from './main'
import {
  calcPosition,
  flushRectCache,
  getClosestScrollContainer,
  makePayloadFactory,
  resolveSelectedElements,
} from './utils'

const DRAG_THRESHOLD = 5

export function createTouchDragDrop(options: Partial<DragDropOptions> = {}): DragDropInstance {
  const opts = resolveOptions(options, { createStyles: () => '' })
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
    snapToGrid,
    collisionDetection,
    plugins = [],
  } = opts

  const resolveCollision = collisionDetection ?? calcPosition

  function snapVal(v: number) {
    return snapToGrid ? Math.round(v / snapToGrid) * snapToGrid : v
  }

  let currentPayload: DragDropPayload | null = null

  const createPayload = makePayloadFactory(opts)

  function onTouchStart(startEvent: TouchEvent) {
    const target = startEvent.target as HTMLElement
    const handleEl = target?.closest<HTMLElement>(handleSelector)
    const dragEl = target?.closest<HTMLElement>(dragElementSelector)
    if (!handleEl || !dragEl)
      return
    if (onBeforeDragStart && !onBeforeDragStart(target))
      return
    const el: HTMLElement = dragEl // capture narrowed type for closures

    const touch0 = startEvent.touches[0]
    const startX = touch0.clientX
    const startY = touch0.clientY
    const rect = el.getBoundingClientRect()
    const offsetX = startX - rect.left
    const offsetY = startY - rect.top
    const dragElements = resolveSelectedElements(el, getSelectedElements)
    const scrollContainer = getClosestScrollContainer(el)

    let ghost: HTMLElement | null = null
    let dragStarted = false
    let isAborted = false
    let lastDropEl: HTMLElement | undefined
    let lastPos: DropPosition | undefined
    let throttleTimer: ReturnType<typeof setTimeout> | undefined

    // Dispatch BeforeDragStart immediately
    const beforePayload = createPayload('BeforeDragStart', startEvent, dragElements, scrollContainer)
    currentPayload = beforePayload
    for (const p of plugins) p.BeforeDragStart?.(beforePayload)

    function onMove(e: TouchEvent) {
      const t = e.touches[0]

      // Phase 1: waiting for threshold to commit to a drag
      if (!dragStarted) {
        if (Math.hypot(t.clientX - startX, t.clientY - startY) <= DRAG_THRESHOLD)
          return
        dragStarted = true
        e.preventDefault()

        ghost = el.cloneNode(true) as HTMLElement
        Object.assign(ghost.style, {
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: '9999',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          opacity: '0.75',
          margin: '0',
          boxSizing: 'border-box',
        })
        document.body.appendChild(ghost)
        flushRectCache()
        ghost.style.top = `${snapVal(t.clientY - offsetY)}px`
        ghost.style.left = `${snapVal(t.clientX - offsetX)}px`

        const startPayload = createPayload('DragStart', e, dragElements, scrollContainer)
        currentPayload = startPayload
        for (const p of plugins) p.DragStart?.(startPayload)
        opts.onDragStart?.(startPayload)
        return
      }

      // Phase 2: drag committed
      e.preventDefault()

      if (dragOverThrottle) {
        if (throttleTimer !== undefined) {
          // keep ghost smooth even while throttled
          ghost!.style.top = `${t.clientY - offsetY}px`
          ghost!.style.left = `${t.clientX - offsetX}px`
          return
        }
        throttleTimer = setTimeout(() => {
          throttleTimer = undefined
        }, dragOverThrottle)
      }

      ghost!.style.top = `${snapVal(t.clientY - offsetY)}px`
      ghost!.style.left = `${snapVal(t.clientX - offsetX)}px`

      const dropEl = document.elementFromPoint(t.clientX, t.clientY)
        ?.closest<HTMLElement>(dropElementSelector) ?? null
      if (!dropEl || !container.contains(dropEl))
        return

      const { top, left, height, width } = dropEl.getBoundingClientRect()
      const rawOffset = vertical ? t.clientY - top : t.clientX - left
      const dim = vertical ? height : width
      const posRules = el !== dropEl
        ? dropPositionFn({ dropElement: dropEl, dragElement: el })
        : 'none' as const
      const position = resolveCollision(posRules, threshold)(snapVal(rawOffset), dim)
      if (position === 'none')
        return
      if (position === lastPos && dropEl === lastDropEl)
        return

      lastPos = position
      lastDropEl = dropEl

      const overPayload = createPayload(
        'DragOver',
        e,
        dragElements,
        getClosestScrollContainer(dropEl),
        dropEl,
        position,
      )
      currentPayload = overPayload
      for (const p of plugins) p.DragOver?.(overPayload)
      opts.onDragOver?.(overPayload)
    }

    function onEscapeKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && dragStarted)
        isAborted = true
    }

    function onEnd(e: TouchEvent) {
      clearTimeout(throttleTimer)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('keydown', onEscapeKey)
      ghost?.remove()

      const aborted = isAborted
      isAborted = false

      if (aborted) {
        const abortPayload = createPayload('DragAbort', e, dragElements, opts.container)
        currentPayload = abortPayload
        for (const p of plugins) p.DragAbort?.(abortPayload)
        opts.onDragAbort?.(abortPayload)
      }

      const endPayload = createPayload(
        'DragEnd',
        e,
        dragElements,
        opts.container,
        aborted ? undefined : currentPayload?.dropElement,
        aborted ? undefined : currentPayload?.position,
      )
      currentPayload = endPayload
      for (const p of plugins) p.DragEnd?.(endPayload)
      opts.onDragEnd?.(endPayload)
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd, { once: true })
    document.addEventListener('keydown', onEscapeKey)
  }

  container.addEventListener('touchstart', onTouchStart, { passive: false })

  return {
    destroy() {
      container.removeEventListener('touchstart', onTouchStart)
    },
  }
}

/**
 * Merges the mouse/HTML5-DnD and touch streams into one instance that works
 * on desktop, mobile, and Chrome DevTools touch simulation.
 *
 * `touchstart` always fires before `mousedown` on hybrid/simulated devices, so
 * a shared flag suppresses the mouse instance whenever touch is active,
 * preventing duplicate events.
 */
export function createUniversalDragDrop(options: Partial<DragDropOptions> = {}): DragDropInstance {
  let activeDragSource: 'mouse' | 'touch' | null = null

  const { onBeforeDragStart: userGuard, plugins: userPlugins = [], ...rest } = options

  const mouse = createMouseDragDrop({
    ...rest,
    onBeforeDragStart: (el: HTMLElement) => {
      if (activeDragSource === 'touch')
        return false
      const guard = userGuard ?? DEFAULTS.onBeforeDragStart
      const ok = guard(el)
      if (ok)
        activeDragSource = 'mouse'
      return ok
    },
    plugins: [
      ...userPlugins,
      { DragEnd: () => { activeDragSource = null } },
    ],
    onDragStart: options.onDragStart,
    onDragOver: options.onDragOver,
    onDragEnd: options.onDragEnd,
  })

  const touch = createTouchDragDrop({
    ...rest,
    plugins: [
      ...userPlugins,
      {
        BeforeDragStart: () => { activeDragSource = 'touch' },
        DragEnd: () => { activeDragSource = null },
      },
    ],
    onDragStart: options.onDragStart,
    onDragOver: options.onDragOver,
    onDragEnd: options.onDragEnd,
  })

  return {
    destroy() {
      mouse.destroy()
      touch.destroy()
    },
  }
}

export default createTouchDragDrop
