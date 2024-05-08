import { Observable, tap } from "rxjs"
import {
  DragDropMiddlewareHookMap,
  DragDropPayload,
  DragDropMiddlewareOperator,
} from "../types"
import { PlaceholderMiddlewareOptions } from "./types"

export const DEFAULTS: PlaceholderMiddlewareOptions = {
  tagName: "div",
  className: "placeholder",
  applyHeight: true,
}

const placeholderElementMiddleware: DragDropMiddlewareOperator<
  PlaceholderMiddlewareOptions
> = (options) => {
  const { tagName, className, applyHeight } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  const placeholderElement = document.createElement(tagName)
  placeholderElement.setAttribute("class", className)

  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, position, dragElements, dropElement }) =>
        (
          ({
            DragOver: () => {
              console.log("dropElement", dropElement)
              dragElements[0].style.display = "none"
              if (position === "before") {
                dropElement?.parentNode?.insertBefore(
                  placeholderElement,
                  dropElement,
                )
              } else if (position === "after") {
                dropElement?.parentNode?.insertBefore(
                  placeholderElement,
                  dropElement.nextSibling,
                )
              }
            },
            DragStart: () => {
              // placeholderElement.setAttribute(
              //   "class",
              //   dropElement?.getAttribute("class") || "",
              // )
              if (applyHeight) {
                placeholderElement.style.height = `${dragElements[0]!.getBoundingClientRect().height}px`
              }

              // @TODO: explain timeout
              setTimeout(() => {
                placeholderElement.classList.add("placeholder")
                dropElement!.before(placeholderElement)
                dropElement!.style.display = "none"
              }, 0)
            },
            DragEnd: () => {
              placeholderElement?.remove?.()
              dragElements[0].style.display = ""
            },
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default placeholderElementMiddleware
