import { DragDropMiddleware, Rect } from "./types"
import { getScrollX, getScrollY, getClosestScrollContainer } from "./helpers"
export interface AutoScrollMiddlewareOptions {
  interval?: number
  steps?: number
  threshold?: number
}

const autoScrollMiddleware = (options: AutoScrollMiddlewareOptions = {}) =>
  (() => {
    const { interval = 8, steps = 4, threshold = 100 } = options
    let scrollContainer: Window | HTMLElement = window
    let scrollInterval: any
    const scroll = (overlapY: number, overlapX: number) => (
      clearInterval(scrollInterval),
      (scrollInterval = setInterval(
        () =>
          scrollContainer.scrollTo({
            top: getScrollY(scrollContainer) + overlapY * steps,
            left: getScrollX(scrollContainer) + overlapX * steps,
          }),
        interval,
      ))
    )

    const cancelScroll = () => (
      clearInterval(scrollInterval), (scrollInterval = false)
    )
    let scrollContainerRect: Rect | DOMRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
    return {
      onDragStart: ({ dragElement }) => {
        scrollContainer = getClosestScrollContainer(dragElement)!
        scrollContainerRect =
          scrollContainer instanceof Window
            ? {
                x: 0,
                y: 0,
                height: scrollContainer.innerHeight,
                width: scrollContainer.innerWidth,
              }
            : scrollContainer.getBoundingClientRect()
      },
      onDragOver: ({ event }) => {
        const overlapY =
          event.clientY - scrollContainerRect.y < threshold
            ? -1
            : event.clientY - scrollContainerRect.y >
                scrollContainerRect.height - threshold
              ? 1
              : 0
        const overlapX =
          event.clientX - scrollContainerRect.x < threshold
            ? -1
            : event.clientX - scrollContainerRect.x >
                scrollContainerRect.width - threshold
              ? 1
              : 0

        if (overlapY || overlapX) {
          scroll(overlapY, overlapX)
        } else {
          cancelScroll()
        }
      },
      onDragEnd: () => cancelScroll(),
      onDrop: () => cancelScroll(),
      onDestroy: () => cancelScroll(),
    }
  }) as DragDropMiddleware

export default autoScrollMiddleware
