import type { Observable } from 'rxjs'
import type {
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DragDropPayload,
} from '../types'
import type { DragImageMiddlewareOptions } from './types'
import { fromEvent, tap } from 'rxjs'
import { fromHTML } from '../utils'

function isTouchEvent(e: Event): e is TouchEvent {
  return typeof TouchEvent !== 'undefined' && e instanceof TouchEvent
}

// #region defaults
export function defaultUpdateElementFn(selectedElements: HTMLElement[]) {
  return fromHTML(
    `<div class='drag-image'>${selectedElements.length} Element(s)</div>`,
  )
}
// #endregion defaults

export function updateContainerStyle(element: HTMLElement, top: number, left: number) {
  return element.setAttribute(
    'style',
    `position: fixed; z-index: 9999; top: ${top}px; left:${left}px; pointer-events: none;`,
  )
}

export const DEFAULTS: DragImageMiddlewareOptions = {
  updateElement: defaultUpdateElementFn,
  minElements: 0,
}
const dragImageMiddleware: DragDropMiddlewareOperator<
  Partial<DragImageMiddlewareOptions>
> = (options?) => {
  const { updateElement, minElements } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  let subscription: any = null
  const customImageContainer = document.createElement('div')

  const mousemove$ = fromEvent<DragEvent>(document, 'dragover')
  const update = (event: DragEvent) =>
    updateContainerStyle(customImageContainer, event.clientY, event.clientX)

  // img is created once per middleware instance but only appended to the DOM
  // during an active drag and removed in stop() to avoid permanent DOM pollution
  const img = new Image(1, 1)
  img.src
    = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

  const stop = () => {
    subscription?.unsubscribe()
    customImageContainer.remove()
    img.remove()
  }

  const startDesktop = (originalEvent: DragEvent) => {
    document.body.appendChild(img)
    originalEvent.dataTransfer?.setDragImage(img, 0, 0)
    document.body.addEventListener('dragend', () => stop(), { once: true })
    subscription = mousemove$.subscribe(update)
    update(originalEvent)
  }

  const startTouch = (originalEvent: TouchEvent) => {
    const t = originalEvent.touches[0]
    if (t) updateContainerStyle(customImageContainer, t.clientY, t.clientX)
    subscription = fromEvent<TouchEvent>(document, 'touchmove').subscribe((e) => {
      const touch = e.touches[0]
      if (touch) updateContainerStyle(customImageContainer, touch.clientY, touch.clientX)
    })
    document.addEventListener('touchend', () => stop(), { once: true })
  }

  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, originalEvent, dragElements }) =>
        (
          ({
            DragStart: () => {
              if (dragElements.length === minElements) {
                return
              }
              customImageContainer.innerHTML = ''
              customImageContainer.appendChild(updateElement(dragElements))
              document.body.appendChild(customImageContainer)
              if (isTouchEvent(originalEvent)) {
                startTouch(originalEvent)
              }
              else {
                startDesktop(originalEvent as DragEvent)
              }
            },
            DragEnd: () => stop(),
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default dragImageMiddleware
