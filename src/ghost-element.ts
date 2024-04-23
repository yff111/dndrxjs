import { Observable, tap } from "rxjs"
import {
  DragDropMiddlewareHookMap,
  DragDropPayload,
  DragDropMiddlewareOperator,
} from "./types"

const ghostElementMiddleware: DragDropMiddlewareOperator = () => {
  const ghostElement = document.createElement("div")
  ghostElement.classList.add("ghost")

  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, position, dragElements, dropElement, options }) =>
        (
          ({
            DragOver: () => {
              if (position === "before") {
                dragElements[0].before(ghostElement)
              } else if (position === "after") {
                dragElements[0].after(ghostElement)
              }
            },
            DragStart: () => {
              ghostElement.setAttribute(
                "class",
                dropElement?.getAttribute("class") || "",
              )
              // @TODO: explain timeout
              setTimeout(() => {
                ghostElement.classList.add("ghost")
                dropElement!.before(ghostElement)
                dropElement!.style.display = "none"
              }, 0)
            },
            DragEnd: () => ghostElement?.remove?.(),
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default { ghostElementMiddleware }
