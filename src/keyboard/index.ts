import type { DragDropInstance, DragDropOptions, DragDropPayload, DropPosition } from '../types'
import { calcPosition } from '../main'
import {
  getClosestScrollContainer,
  makePayloadFactory,
  resolveSelectedElements,
} from '../utils'
import { resolveOptions } from '../main'

export interface KeyboardDragDropOptions extends Partial<DragDropOptions> {
  /**
   * Keys that pick up / drop the focused draggable. Defaults to Space and Enter.
   */
  activationKeys?: string[]
}

/**
 * A keyboard-driven drag sensor. Wire it alongside mouse/touch instances so
 * users can navigate and drop without a pointer device.
 *
 * State machine:
 *   IDLE   → Space/Enter on a drag element  → ACTIVE
 *   ACTIVE → Arrow / Tab                    → cycles drop targets
 *   ACTIVE → Space / Enter                  → confirms drop (DragEnd)
 *   ACTIVE → Escape                         → aborts (DragAbort + DragEnd)
 */
export function createKeyboardDragDrop(
  options: KeyboardDragDropOptions = {},
): DragDropInstance {
  const { activationKeys = [' ', 'Enter'], ...rest } = options
  const opts = resolveOptions(rest)
  const {
    container,
    dragElementSelector,
    dropElementSelector,
    dropPositionFn,
    threshold,
    collisionDetection,
    getSelectedElements,
    plugins = [],
  } = opts

  const resolveCollision = collisionDetection ?? calcPosition
  const createPayload = makePayloadFactory(opts)

  let isDragging = false
  let dragElements: HTMLElement[] = []
  let dropTargets: HTMLElement[] = []
  let dropIndex = 0
  let currentPosition: DropPosition = 'before'
  let currentDropEl: HTMLElement | undefined

  function dispatch(payload: DragDropPayload) {
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

  function computeInitialPosition(dragEl: HTMLElement, dropEl: HTMLElement): DropPosition {
    const rules = dragEl !== dropEl ? dropPositionFn({ dragElement: dragEl, dropElement: dropEl }) : 'none'
    // Use offset=0 so we always land at 'before' when first hovering
    return resolveCollision(rules, threshold)(0, 1)
  }

  function moveTo(index: number, e: KeyboardEvent) {
    dropIndex = index
    const dropEl = dropTargets[dropIndex]
    if (!dropEl)
      return

    currentDropEl = dropEl
    currentPosition = computeInitialPosition(dragElements[0], dropEl)

    const payload = createPayload(
      'DragOver',
      e,
      dragElements,
      getClosestScrollContainer(dropEl),
      dropEl,
      currentPosition,
    )
    dispatch(payload)
    dropEl.scrollIntoView({ block: 'nearest' })
  }

  function startDrag(dragEl: HTMLElement, e: KeyboardEvent) {
    e.preventDefault()
    isDragging = true
    dragElements = resolveSelectedElements(dragEl, getSelectedElements)
    dropTargets = Array.from(
      container.querySelectorAll<HTMLElement>(dropElementSelector),
    ).filter(el => !dragElements.includes(el))

    const scrollContainer = getClosestScrollContainer(dragEl)
    dispatch(createPayload('DragStart', e, dragElements, scrollContainer))

    // Start hovering on the element after the first dragged item
    const startIdx = Math.min(
      dropTargets.findIndex(el => !dragElements.includes(el)),
      dropTargets.length - 1,
    )
    dropIndex = Math.max(startIdx, 0)
    if (dropTargets.length > 0)
      moveTo(dropIndex, e)
  }

  function confirmDrop(e: KeyboardEvent) {
    e.preventDefault()
    isDragging = false
    dispatch(createPayload(
      'DragEnd',
      e,
      dragElements,
      opts.container,
      currentDropEl,
      currentPosition,
    ))
  }

  function abortDrag(e: KeyboardEvent) {
    e.preventDefault()
    isDragging = false
    dispatch(createPayload('DragAbort', e, dragElements, opts.container))
    dispatch(createPayload('DragEnd', e, dragElements, opts.container))
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!isDragging) {
      if (!activationKeys.includes(e.key))
        return
      const focused = document.activeElement as HTMLElement | null
      if (!focused)
        return
      const dragEl = focused.closest<HTMLElement>(dragElementSelector)
      if (!dragEl || !container.contains(dragEl))
        return
      startDrag(dragEl, e)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        moveTo(Math.min(dropIndex + 1, dropTargets.length - 1), e)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        moveTo(Math.max(dropIndex - 1, 0), e)
        break
      case 'Tab':
        e.preventDefault()
        moveTo(e.shiftKey
          ? Math.max(dropIndex - 1, 0)
          : Math.min(dropIndex + 1, dropTargets.length - 1), e)
        break
      case ' ':
      case 'Enter':
        confirmDrop(e)
        break
      case 'Escape':
        abortDrag(e)
        break
    }
  }

  document.addEventListener('keydown', onKeyDown)

  return {
    destroy() {
      document.removeEventListener('keydown', onKeyDown)
    },
  }
}

export default createKeyboardDragDrop
