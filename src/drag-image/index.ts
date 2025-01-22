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

  const stop = () => {
    subscription?.unsubscribe()
    customImageContainer.remove()
  }

  const start = () => {
    document.body.addEventListener('dragend', () => stop(), false)
    subscription = mousemove$.subscribe(update)
  }

  // add dummy drag image
  const img = new Image(1, 1)
  img.src
    = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  document.body.appendChild(img)
  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, originalEvent, dragElements }) =>
        (
          ({
            DragStart: () => {
              if (dragElements.length === minElements) {
                return
              }
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
