import type { DragDropPlugin, Rect } from '../types'
import type { AutoScrollPluginOptions } from './types'
import { getScrollX, getScrollY } from '../utils'

function getClientCoords(event: DragEvent | MouseEvent | TouchEvent | KeyboardEvent) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const t = event.touches[0] ?? event.changedTouches[0]
    return { clientX: t?.clientX ?? 0, clientY: t?.clientY ?? 0 }
  }
  if (event instanceof KeyboardEvent)
    return { clientX: 0, clientY: 0 }
  return { clientX: (event as MouseEvent).clientX, clientY: (event as MouseEvent).clientY }
}

export const DEFAULTS: AutoScrollPluginOptions = {
  interval: 8,
  steps: 4,
  threshold: 100,
}

function autoScroll(options?: Partial<AutoScrollPluginOptions>): DragDropPlugin {
  const { interval, steps, threshold } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  let scrollInterval: ReturnType<typeof setInterval> | undefined
  let currentScrollContainer: HTMLElement | Window = window
  let scrollContainerRect: Rect | DOMRect = { x: 0, y: 0, width: 0, height: 0 }

  const scroll = (scrollDirY: number, scrollDirX: number) => {
    clearInterval(scrollInterval)
    scrollInterval = setInterval(
      () =>
        currentScrollContainer.scrollTo({
          top: getScrollY(currentScrollContainer) + scrollDirY * steps,
          left: getScrollX(currentScrollContainer) + scrollDirX * steps,
        }),
      interval,
    )
  }

  const cancelScroll = () => {
    clearInterval(scrollInterval)
    scrollInterval = undefined
  }

  const updateScrollContainer = (element: HTMLElement | Window) => {
    currentScrollContainer = element
    scrollContainerRect
      = element instanceof Window
        ? { x: 0, y: 0, height: element.innerHeight, width: element.innerWidth }
        : element.getBoundingClientRect()
  }

  return {
    DragStart({ scrollContainer }) {
      updateScrollContainer(scrollContainer)
    },
    DragOver({ scrollContainer, originalEvent }) {
      if (scrollContainer !== currentScrollContainer) {
        updateScrollContainer(scrollContainer)
      }
      const { clientX, clientY } = getClientCoords(originalEvent)
      const scrollDirY
        = clientY - scrollContainerRect.y < threshold
          ? -1
          : clientY - scrollContainerRect.y > scrollContainerRect.height - threshold
            ? 1
            : 0
      const scrollDirX
        = clientX - scrollContainerRect.x < threshold
          ? -1
          : clientX - scrollContainerRect.x > scrollContainerRect.width - threshold
            ? 1
            : 0

      if (scrollDirY || scrollDirX)
        scroll(scrollDirY, scrollDirX)
      else cancelScroll()
    },
    DragEnd() { cancelScroll() },
  }
}

export { autoScroll }
export default autoScroll
