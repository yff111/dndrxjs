import type { DragDropPayload, DragDropPlugin } from '../types'

export interface AnnouncerOptions {
  /**
   * Override individual announcement messages.
   * Each function receives the current payload and returns the string to read.
   */
  announcements: {
    onDragStart?: (payload: DragDropPayload) => string
    onDragOver?: (payload: DragDropPayload) => string
    onDragEnd?: (payload: DragDropPayload) => string
    onDragAbort?: (payload: DragDropPayload) => string
  }
}

const DEFAULTS: Required<AnnouncerOptions['announcements']> = {
  onDragStart: () => 'Picked up draggable item. Use arrow keys to move, Space or Enter to drop, Escape to cancel.',
  onDragOver: ({ dropElement, position }) =>
    dropElement
      ? `Over ${dropElement.textContent?.trim().slice(0, 40) ?? 'item'}, position: ${position}.`
      : 'Not over a drop target.',
  onDragEnd: ({ dropElement, position }) =>
    dropElement
      ? `Dropped ${position} ${dropElement.textContent?.trim().slice(0, 40) ?? 'item'}.`
      : 'Drop complete.',
  onDragAbort: () => 'Drag cancelled.',
}

/**
 * Plugin that announces drag events to screen readers via an `aria-live` region.
 * Add it to `plugins` or pass `announcer: true` to `createDragDrop`.
 *
 * @example
 * createDragDrop(el, { plugins: [announcer()] })
 */
function announcer(options?: Partial<AnnouncerOptions>): DragDropPlugin {
  const a = { ...DEFAULTS, ...options?.announcements }

  const region = document.createElement('div')
  region.setAttribute('role', 'status')
  region.setAttribute('aria-live', 'assertive')
  region.setAttribute('aria-atomic', 'true')
  // Visually hidden but accessible
  region.style.cssText
    = 'position:fixed;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;'

  function announce(message: string) {
    // Clear first so repeated identical messages still trigger a read
    region.textContent = ''
    requestAnimationFrame(() => {
      region.textContent = message
    })
  }

  return {
    DragStart(payload) {
      document.body.appendChild(region)
      announce(a.onDragStart(payload))
    },
    DragOver(payload) {
      announce(a.onDragOver(payload))
    },
    DragAbort(payload) {
      announce(a.onDragAbort(payload))
    },
    DragEnd(payload) {
      announce(a.onDragEnd(payload))
      setTimeout(() => region.remove(), 1500)
    },
  }
}

export { announcer }
export default announcer
