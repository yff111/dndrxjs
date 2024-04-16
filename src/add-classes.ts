import { DragDropMiddleware } from "./types"

export type AddClassesMiddlewareOptions = {
  dragClass: string
  dropClass: string
  activeContainerClass: string
}
const addClassesMiddleware = (
  {
    dragClass,
    dropClass,
    activeContainerClass,
  }: AddClassesMiddlewareOptions = {
    dragClass: "dragging",
    dropClass: "drop",
    activeContainerClass: "active",
  },
) =>
  ((state) => {
    const { container } = state
    const clear = (scrollContainer?: HTMLElement | Window) => {
      if (scrollContainer instanceof HTMLElement) {
        scrollContainer.classList.remove(activeContainerClass)
      }
      container
        .querySelectorAll("." + dragClass)
        .forEach((e: Element) => e.classList.remove(dragClass))
    }
    return {
      onDragStart: ({ dragElement, selectedElements, scrollContainer }) => {
        if (scrollContainer instanceof HTMLElement) {
          scrollContainer.classList.add(activeContainerClass)
        }
        if (selectedElements.length > 1) {
          selectedElements.forEach((el) => el.classList.add(dragClass))
        } else {
          dragElement?.classList?.add(dragClass)
        }
        selectedElements.forEach((e) => e.classList.remove(dropClass))
      },
      onDragEnterContainer: ({ scrollContainer }) => {
        if (scrollContainer instanceof HTMLElement) {
          scrollContainer.classList.add(activeContainerClass)
        }
      },
      onDragLeaveContainer: ({ scrollContainer }) => {
        if (scrollContainer instanceof HTMLElement) {
          scrollContainer.classList.remove(activeContainerClass)
        }
      },
      onDrop: ({ selectedElements, scrollContainer }) => {
        clear(scrollContainer)
        selectedElements.forEach((e) => e.classList.add(dropClass))
      },
    }
  }) as DragDropMiddleware

export default addClassesMiddleware
