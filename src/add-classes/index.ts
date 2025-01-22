import type { Observable } from 'rxjs'
import type {
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DragDropPayload,
  GetElementIdFn,
} from '../types'
import type { AddClassesMiddlewareOptions } from './types'
import { map, pairwise, tap } from 'rxjs'
import { isWindow } from '../utils'

export function addClassWhenAddedToDom(selectedElements: HTMLElement[], selector: string, cssClass: string, getElementId: GetElementIdFn, container: HTMLElement = document.body, timeout: number = 100) {
  const selectedElementIds = selectedElements.map(getElementId)
  const observer = new MutationObserver(mutations =>
    mutations.forEach(mutation =>
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          const newNodes = node.matches?.(selector)
            ? [node]
            : (Array.from(node.querySelectorAll(selector)) as HTMLElement[]) // check for matching child nodes if parent did not match
          // match selected elements with added nodes
          newNodes.forEach((n) => {
            if (selectedElementIds.includes(getElementId(n))) {
              n.addEventListener(
                'animationend',
                () => n.classList.remove(cssClass),
                { once: true },
              )
              n.classList.add(cssClass)
            }
          })
        }
        observer.disconnect()
      }),
    ),
  )
  observer.observe(container, { childList: true, subtree: true })

  // auto remove observer after timeout
  if (timeout) {
    setTimeout(() => observer.disconnect(), timeout)
  }
  return observer
}

export const DEFAULTS: AddClassesMiddlewareOptions = {
  dragClass: 'drag',
  dragOverClass: 'dragover',
  dropClass: 'drop',
  activeContainerClass: 'active',
}
const addClassesMiddleware: DragDropMiddlewareOperator<
  AddClassesMiddlewareOptions
> = (options?) => {
  const { dragClass, dropClass, dragOverClass, activeContainerClass } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  const clear = (scrollContainer?: HTMLElement | Window) => {
    if (scrollContainer instanceof HTMLElement) {
      scrollContainer.classList.remove(activeContainerClass)
    }
    document.body.querySelectorAll(` .${dragClass}`).forEach((e: Element) => {
      e.classList.remove(dragClass)
    })
  }

  const clearDragOverClass = (currentDropElement?: HTMLElement) =>
    document
      .querySelectorAll(`.${dragOverClass}`)
      .forEach(
        e => e !== currentDropElement && e?.classList.remove(dragOverClass),
      )

  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      pairwise(),
      tap(([prev, current]) => {
        if (current.scrollContainer !== prev.scrollContainer) {
          if (current.scrollContainer instanceof HTMLElement) {
            current.scrollContainer.classList.add(activeContainerClass)
          }
          if (prev.scrollContainer instanceof HTMLElement) {
            prev.scrollContainer.classList.remove(activeContainerClass)
          }
        }
      }),
      map(array => array[1]),
      tap(({ type, scrollContainer, dragElements, dropElement, options }) =>
        (
          ({
            DragOver: () => {
              clearDragOverClass(dropElement!)
              dropElement?.classList.add(dragOverClass)
            },
            DragStart: () => {
              dragElements.forEach(el => el.classList.add(dragClass))
            },
            BeforeDragStart: () => {
              if (scrollContainer instanceof HTMLElement) {
                scrollContainer.classList.add(activeContainerClass)
              }
              dragElements.forEach(e => e.classList.remove(dropClass))
            },
            DragEnd: () => {
              clear(scrollContainer)
              clearDragOverClass()
              addClassWhenAddedToDom(
                dragElements,
                options.dragElementSelector!,
                dropClass,
                options.getElementId!,
                isWindow(scrollContainer) ? document.body : scrollContainer!,
              )
            },
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}
export default addClassesMiddleware
