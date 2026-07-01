import type { DragDropInstance, DragDropOptions, DragDropPayload } from './types'
import {
  calcPosition,
  flushRectCache,
  getClosestScrollContainer,
  getRectCached,
  makePayloadFactory,
  resolveSelectedElements,
  setAttributesTo,
} from './utils'

export { calcPosition }

export const DEFAULTS: DragDropOptions = {
  container: document.body,
  dragElementSelector: '[data-id]',
  dropElementSelector: '[data-id]',
  handleSelector: '[data-id]',
  getElementId: (el: HTMLElement) => el.getAttribute('data-id') as string,
  dropPositionFn: () => 'around',
  vertical: true,
  dragOverThrottle: 20,
  threshold: 0.3,
  enableRectCaching: false,
  createStyles: (
    dropElementSelector: string,
    dragElementSelector: string,
    handleSelector: string,
  ) =>
    `${dropElementSelector}:not(tr) * { pointer-events: none;} tr${dropElementSelector} td * { pointer-events: none;}  ${dropElementSelector}, ${dragElementSelector}, ${handleSelector} {pointer-events: all!important;}`,
  onBeforeDragStart: (el: HTMLElement) =>
    !el.closest('button:not([data-id]), a:not([data-id]), input, textarea'),
}

export function resolveOptions(options: Partial<DragDropOptions>, overrides?: Partial<DragDropOptions>): DragDropOptions {
  const merged = { ...DEFAULTS, ...overrides, ...options } as DragDropOptions
  if (!merged.handleSelector)
    merged.handleSelector = merged.dragElementSelector
  return merged
}

export function createMouseDragDrop(options: Partial<DragDropOptions> = {}): DragDropInstance {
  const opts = resolveOptions(options)
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
    createStyles,
    snapToGrid,
    collisionDetection,
    plugins = [],
  } = opts

  let currentPayload: DragDropPayload | null = null
  let isDragging = false
  let throttleTimer: ReturnType<typeof setTimeout> | undefined
  let lastRawOffset: number | null = null
  let lastRawDropEl: HTMLElement | null = null
  let lastPosition: string | null = null
  let lastPositionDropEl: HTMLElement | null = null

  const styleNode = document.createElement('style')
  styleNode.textContent = createStyles(dropElementSelector, dragElementSelector, handleSelector)

  const createPayload = makePayloadFactory(opts)

  const resolveCollision = collisionDetection ?? calcPosition

  function dispatch(payload: DragDropPayload) {
    currentPayload = payload
    for (const p of plugins) p[payload.type]?.(payload)
    if (payload.type === 'DragStart')
      opts.onDragStart?.(payload)
    else if (payload.type === 'DragOver')
      opts.onDragOver?.(payload)
    else if (payload.type === 'DragAbort')
      opts.onDragAbort?.(payload)
    else if (payload.type === 'DragEnd')
      opts.onDragEnd?.(payload)
  }

  function snapOffset(offset: number) {
    return snapToGrid ? Math.round(offset / snapToGrid) * snapToGrid : offset
  }

  function resolvePosition(dropElement: HTMLElement, dragElement: HTMLElement, rawOffset: number) {
    const rules = dragElement !== dropElement
      ? dropPositionFn({ dropElement, dragElement })
      : 'none' as const
    const rect = getRectCached(dropElement, getElementId, container)
    return resolveCollision(rules, threshold)(snapOffset(rawOffset), vertical ? rect.height : rect.width)
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    if (!isDragging || !currentPayload)
      return

    if (dragOverThrottle) {
      if (throttleTimer !== undefined)
        return
      throttleTimer = setTimeout(() => {
        throttleTimer = undefined
      }, dragOverThrottle)
    }

    const offset = vertical ? e.offsetY : e.offsetX
    const dropElement = (e.target as HTMLElement)?.closest?.(dropElementSelector) as HTMLElement | null

    // skip when neither offset nor target changed
    if (offset === lastRawOffset && dropElement === lastRawDropEl)
      return
    lastRawOffset = offset
    lastRawDropEl = dropElement

    if (!dropElement)
      return

    const position = resolvePosition(dropElement, currentPayload.dragElements[0], offset)

    // skip when position and target are both unchanged
    if (position === lastPosition && dropElement === lastPositionDropEl)
      return
    lastPosition = position
    lastPositionDropEl = dropElement

    if (position === 'none' || !container.contains(dropElement))
      return

    dispatch(createPayload(
      'DragOver',
      e,
      currentPayload.dragElements,
      getClosestScrollContainer(dropElement),
      dropElement,
      position,
    ))
  }

  function cleanupDragState(e: DragEvent | MouseEvent) {
    isDragging = false
    clearTimeout(throttleTimer)
    throttleTimer = undefined
    lastRawOffset = null
    lastRawDropEl = null
    lastPosition = null
    lastPositionDropEl = null
    e.preventDefault()
    styleNode.remove()
    setAttributesTo(dragElementSelector, 'draggable', 'false', container)
    document.body.removeEventListener('dragover', onDragOver)
    document.body.removeEventListener('dragend', onDragEnd)
    document.body.removeEventListener('mouseup', onDragEnd)
  }

  function onDragEnd(e: DragEvent | MouseEvent) {
    if (!isDragging)
      return

    // dataTransfer.dropEffect is 'none' when the drag was cancelled (Escape key
    // or released outside any accepting target). This is more reliable than
    // listening for keydown, which browsers suppress during HTML5 DnD.
    const aborted = e instanceof DragEvent && e.dataTransfer?.dropEffect === 'none'

    cleanupDragState(e)

    if (aborted) {
      dispatch(createPayload('DragAbort', e, currentPayload!.dragElements, currentPayload!.scrollContainer))
    }

    dispatch(createPayload(
      'DragEnd',
      e,
      currentPayload!.dragElements,
      currentPayload!.scrollContainer,
      aborted ? undefined : currentPayload!.dropElement,
      aborted ? undefined : currentPayload!.position,
    ))
  }

  function onDragStart(e: DragEvent) {
    const dragElement = (e.target as HTMLElement).closest?.(dragElementSelector) as HTMLElement | null
    if (!dragElement || isDragging)
      return

    isDragging = true
    document.removeEventListener('mouseup', cleanupDraggable)

    if (window.getSelection()?.type === 'Range') {
      e.preventDefault()
      document.getSelection()?.empty()
    }
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.dropEffect = 'move'
    flushRectCache()
    document.head.appendChild(styleNode)

    document.body.addEventListener('dragover', onDragOver)
    document.body.addEventListener('dragend', onDragEnd)
    document.body.addEventListener('mouseup', onDragEnd)

    dispatch(createPayload(
      'DragStart',
      e,
      resolveSelectedElements(dragElement, getSelectedElements),
      getClosestScrollContainer(dragElement),
    ))
  }

  // Cleans up the draggable attribute when mouseup fires before dragstart
  function cleanupDraggable() {
    setAttributesTo(dragElementSelector, 'draggable', 'false', container)
  }

  function onMouseDown(e: MouseEvent) {
    if (!(e.target instanceof HTMLElement))
      return
    if (!e.target.closest(handleSelector))
      return
    if (onBeforeDragStart && !onBeforeDragStart(e.target))
      return

    const dragElement = e.target.closest<HTMLElement>(dragElementSelector)
    if (!dragElement)
      return

    dragElement.setAttribute('draggable', 'true')
    document.addEventListener('mouseup', cleanupDraggable, { once: true })

    const payload = createPayload(
      'BeforeDragStart',
      e,
      resolveSelectedElements(dragElement, getSelectedElements),
      getClosestScrollContainer(dragElement),
    )
    currentPayload = payload
    for (const p of plugins) p.BeforeDragStart?.(payload)
  }

  container.addEventListener('mousedown', onMouseDown)
  container.addEventListener('dragstart', onDragStart)

  return {
    destroy() {
      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('dragstart', onDragStart)
      document.body.removeEventListener('dragover', onDragOver)
      document.body.removeEventListener('dragend', onDragEnd)
      document.body.removeEventListener('mouseup', onDragEnd)
      document.removeEventListener('mouseup', cleanupDraggable)
      clearTimeout(throttleTimer)
      styleNode.remove()
    },
  }
}

export default createMouseDragDrop
