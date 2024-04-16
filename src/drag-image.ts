import { fromEvent } from "rxjs"
import { fromHTML } from "./helpers"
import { DragDropMiddlewareFn } from "./types"

export const defaultUpdateElementFn = (selectedElements: HTMLElement[]) =>
  fromHTML(
    `<div style="background: black; padding: 2px 8px; color: white; margin: 10px; font-size: 13px; font-weight: bold; border-radius: 10px;">${selectedElements.length} Element(s)</div>`,
  )

export const defaultUpdateContainerStyleFn = (
  element: HTMLElement,
  top: number,
  left: number,
) =>
  element.setAttribute(
    "style",
    `position: fixed; z-index: 9999; top: ${top}px; left:${left}px; pointer-events: none;`,
  )

export interface DragImageMiddlewareOptions {
  updateContainerStyle?: (
    element: HTMLElement,
    top: number,
    left: number,
  ) => any
  updateElement?: (selectedElements: HTMLElement[]) => HTMLElement
  minElements?: number
}
const dragImageMiddleware: DragDropMiddlewareFn<DragImageMiddlewareOptions> =
  (options) => () => {
    const customImageContainer = document.createElement("div")
    const {
      updateElement = defaultUpdateElementFn,
      updateContainerStyle = defaultUpdateContainerStyleFn,
      minElements = 0,
    } = options!
    let subscription: any = null

    const mousemove$ = fromEvent<DragEvent>(document, "dragover")
    const update = (event: DragEvent) =>
      updateContainerStyle(customImageContainer, event.clientY, event.clientX)

    const start = () => {
      document.body.addEventListener("dragend", () => (stop(), false))
      subscription = mousemove$.subscribe(update)
    }

    const stop = () => {
      subscription?.unsubscribe()
      customImageContainer.remove()
    }
    // add dummy drag image
    const img = new Image(1, 1)
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
    document.body.appendChild(img)
    return {
      onDragStart: ({ selectedElements, event }) => {
        if (selectedElements.length === minElements) {
          return
        }
        // set dummy drag Image
        event.dataTransfer?.setDragImage(img, 0, 0)
        start()
        customImageContainer.innerHTML = ""
        customImageContainer.appendChild(updateElement(selectedElements))
        document.body.appendChild(customImageContainer)
        update(event)
      },
      onDestroy: () => stop(),
      onDrop: () => stop(),
    }
  }

export default dragImageMiddleware
