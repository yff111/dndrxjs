import type { Observable } from 'rxjs'
import type {
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DragDropPayload,
} from '../types'
import type { DragImageMiddlewareOptions } from './types'
import { fromEvent, tap } from 'rxjs'
import { fromHTML } from '../utils'

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

  const start = () => {
    document.body.addEventListener('dragend', () => stop(), { once: true })
    subscription = mousemove$.subscribe(update)
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
              document.body.appendChild(img)
              // set dummy drag Image
              ;(originalEvent as DragEvent).dataTransfer?.setDragImage(
                img,
                0,
                0,
              )
              start()
              customImageContainer.innerHTML = ''
              customImageContainer.appendChild(updateElement(dragElements))
              document.body.appendChild(customImageContainer)
              update(originalEvent as DragEvent)
            },
            DragEnd: () => stop(),
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default dragImageMiddleware
