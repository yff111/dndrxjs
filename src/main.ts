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
  createStyleNode: (
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
    createStyleNode,
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
  styleNode.textContent = createStyleNode(dropElementSelector, dragElementSelector, handleSelector)

  const createPayload = makePayloadFactory(opts)

  function dispatch(payload: DragDropPayload) {
    currentPayload = payload
    for (const p of plugins) p[payload.type]?.(payload)
    if (payload.type === 'DragStart')
      opts.onDragStart?.(payload)
    else if (payload.type === 'DragOver')
      opts.onDragOver?.(payload)
    else if (payload.type === 'DragEnd')
      opts.onDragEnd?.(payload)
  }

  function calcPositionLocal(dropElement: HTMLElement, dragElement: HTMLElement, offset: number) {
    const rules = dragElement !== dropElement
      ? dropPositionFn({ dropElement, dragElement })
      : 'none' as const
    const rect = getRectCached(dropElement, getElementId, container)
    return calcPosition(rules, threshold)(offset, vertical ? rect.height : rect.width)
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

    const position = calcPositionLocal(dropElement, currentPayload.dragElements[0], offset)

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

  function onDragEnd(e: DragEvent | MouseEvent) {
    if (!isDragging)
      return
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

    dispatch(createPayload(
      'DragEnd',
      e,
      currentPayload!.dragElements,
      currentPayload!.container,
      currentPayload!.dropElement,
      currentPayload!.position,
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
