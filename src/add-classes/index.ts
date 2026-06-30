import type { Observable } from 'rxjs'
import type {
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DragDropPayload,
  GetElementIdFn,
} from '../types'
import type { AddClassesMiddlewareOptions } from './types'
import { tap } from 'rxjs'
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
    document.body.querySelectorAll(`.${dragClass}`).forEach((e: Element) => {
      e.classList.remove(dragClass)
    })
  }

  return (source: Observable<DragDropPayload>) => {
    let prevScrollContainer: HTMLElement | Window | null = null
    let prevDragOverEl: HTMLElement | null = null
    return source.pipe(
      tap(({ type, scrollContainer, dragElements, dropElement, options }) => {
        if (scrollContainer !== prevScrollContainer) {
          if (scrollContainer instanceof HTMLElement) {
            scrollContainer.classList.add(activeContainerClass)
          }
          if (prevScrollContainer instanceof HTMLElement) {
            prevScrollContainer.classList.remove(activeContainerClass)
          }
          prevScrollContainer = scrollContainer
        }
        ;(
          ({
            DragOver: () => {
              if (prevDragOverEl && prevDragOverEl !== dropElement) {
                prevDragOverEl.classList.remove(dragOverClass)
              }
              dropElement?.classList.add(dragOverClass)
              prevDragOverEl = dropElement ?? null
            },
            DragStart: () => {
              dragElements.forEach(el => el.classList.add(dragClass))
            },
            BeforeDragStart: () => {
              dragElements.forEach(e => e.classList.remove(dropClass))
            },
            DragEnd: () => {
              clear(scrollContainer)
              prevDragOverEl?.classList.remove(dragOverClass)
              prevDragOverEl = null
              prevScrollContainer = null
              addClassWhenAddedToDom(
                dragElements,
                options.dragElementSelector!,
                dropClass,
                options.getElementId!,
                isWindow(scrollContainer) ? document.body : scrollContainer!,
              )
            },
          }) as DragDropMiddlewareHookMap
        )[type]?.()
      }),
    )
  }
}
export default addClassesMiddleware
