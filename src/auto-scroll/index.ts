import type { Observable } from 'rxjs'
import type {
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DragDropPayload,
  Rect,
} from '../types'
import type { AutoScrollMiddlewareOptions } from './types'
import { tap } from 'rxjs'
import { getScrollX, getScrollY } from '../utils'

function getClientCoords(event: DragEvent | MouseEvent | TouchEvent) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const t = event.touches[0] ?? event.changedTouches[0]
    return { clientX: t?.clientX ?? 0, clientY: t?.clientY ?? 0 }
  }
  return { clientX: (event as MouseEvent).clientX, clientY: (event as MouseEvent).clientY }
}

export const DEFAULTS: AutoScrollMiddlewareOptions = {
  interval: 8,
  steps: 4,
  threshold: 100,
}

const autoScrollMiddleware: DragDropMiddlewareOperator<
  AutoScrollMiddlewareOptions
> = (options?) => {
  const { interval, steps, threshold } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS
  let scrollInterval: any
  let currentScrollContainer: HTMLElement | Window = window

  const scroll = (overlapY: number, overlapX: number) => {
    clearInterval(scrollInterval)
    scrollInterval = setInterval(
      () =>
        currentScrollContainer!.scrollTo({
          top: getScrollY(currentScrollContainer!) + overlapY * steps,
          left: getScrollX(currentScrollContainer!) + overlapX * steps,
        }),
      interval,
    )
  }
  const cancelScroll = () => {
    clearInterval(scrollInterval)
    scrollInterval = false
  }
  let scrollContainerRect: Rect | DOMRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  const updateScrollContainer = (element: HTMLElement | Window) => {
    currentScrollContainer = element
    scrollContainerRect
      = element instanceof Window
        ? {
            x: 0,
            y: 0,
            height: element.innerHeight,
            width: element.innerWidth,
          }
        : element!.getBoundingClientRect()
  }

  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, scrollContainer, originalEvent }) =>
        (
          ({
            DragStart: () => updateScrollContainer(scrollContainer!),
            DragOver: () => {
              if (scrollContainer !== currentScrollContainer) {
                updateScrollContainer(scrollContainer!)
              }
              const { clientX, clientY } = getClientCoords(originalEvent)
              const overlapY
                = clientY - scrollContainerRect.y < threshold
                  ? -1
                  : clientY - scrollContainerRect.y
                    > scrollContainerRect.height - threshold
                    ? 1
                    : 0
              const overlapX
                = clientX - scrollContainerRect.x < threshold
                  ? -1
                  : clientX - scrollContainerRect.x
                    > scrollContainerRect.width - threshold
                    ? 1
                    : 0

              if (overlapY || overlapX) {
                scroll(overlapY, overlapX)
              }
              else {
                cancelScroll()
              }
            },
            DragEnd: () => cancelScroll(),
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default autoScrollMiddleware
