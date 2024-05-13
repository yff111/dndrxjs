import { Observable, tap } from "rxjs"
import {
  DragDropMiddlewareHookMap,
  DragDropPayload,
  DragDropMiddlewareOperator,
} from "../types"
import { PlaceholderMiddlewareOptions } from "./types"

export const createSimplePlaceholder = (dragElements: HTMLElement[]) => {
  const tagName = dragElements[0].tagName
  const placeholderElement = document.createElement(tagName)
  placeholderElement.style.height = `${dragElements[0]!.getBoundingClientRect().height}px`
  return [placeholderElement]
}
export const createClonedPlaceholder = (dragElements: HTMLElement[]) => {
  const placeholderElements = dragElements.map(
    (el) => el.cloneNode(true) as HTMLElement,
  )
  placeholderElements.forEach((el) => {
    el.classList.add("placeholder")
    el.removeAttribute("data-id")
  })
  return placeholderElements.splice(0, 1)
}

export const DEFAULTS: PlaceholderMiddlewareOptions = {
  createElement: createClonedPlaceholder,
}

const placeholderElementMiddleware: DragDropMiddlewareOperator<
  PlaceholderMiddlewareOptions
> = (options) => {
  const { createElement } = options ? { ...DEFAULTS, ...options } : DEFAULTS

  let placeholderElements: HTMLElement[]
  let dragStart = false
  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, position, dragElements, dropElement }) =>
        (
          ({
            BeforeDragStart: () => {
              placeholderElements = createElement(dragElements)
            },
            DragStart: () => {
              dragStart = true
            },
            DragOver: () => {
              if (dragStart) {
                dragStart = false
                // hide drag elements only after dragStart once
                dragElements?.forEach((el) => (el.style.display = "none"))
              }
              dragStart = true
              if (position === "before") {
                placeholderElements
                  .reverse()
                  .forEach((el) =>
                    dropElement?.parentNode?.insertBefore(el, dropElement),
                  )
              } else if (position === "after") {
                placeholderElements
                  .reverse()
                  .forEach((el) =>
                    dropElement?.parentNode?.insertBefore(
                      el,
                      dropElement.nextSibling,
                    ),
                  )
              }
            },
            DragEnd: () => {
              placeholderElements?.forEach((el) => el.remove?.())
              dragElements?.forEach((el) => (el.style.display = ""))
            },
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default placeholderElementMiddleware
