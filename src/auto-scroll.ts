import { DragDropMiddleware, Rect } from "./types"
import { getScrollX, getScrollY } from "./helpers"
export interface AutoScrollMiddlewareOptions {
  interval?: number
  steps?: number
  threshold?: number
}

const autoScrollMiddleware = (options: AutoScrollMiddlewareOptions = {}) =>
  (() => {
    const { interval = 8, steps = 4, threshold = 100 } = options
    let scrollInterval: any
    let currentScrollContainer: HTMLElement | Window = window

    const scroll = (overlapY: number, overlapX: number) => (
      clearInterval(scrollInterval),
      (scrollInterval = setInterval(
        () =>
          currentScrollContainer!.scrollTo({
            top: getScrollY(currentScrollContainer!) + overlapY * steps,
            left: getScrollX(currentScrollContainer!) + overlapX * steps,
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

    const updateScrollContainer = (element: HTMLElement | Window) => {
      currentScrollContainer = element
      scrollContainerRect =
        element instanceof Window
          ? {
              x: 0,
              y: 0,
              height: element.innerHeight,
              width: element.innerWidth,
            }
          : element!.getBoundingClientRect()
    }

    return {
      onDragStart: ({ scrollContainer }) =>
        updateScrollContainer(scrollContainer!),
      onDragOver: ({ event, scrollContainer }) => {
        if (scrollContainer !== currentScrollContainer) {
          updateScrollContainer(scrollContainer!)
        }
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
