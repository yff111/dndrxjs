import { DragDropMiddleware } from "./types"

export type AddClassesMiddlewareOptions = {
  dragClass: string
  dropClass: string
}
const addClassesMiddleware = (
  { dragClass, dropClass }: AddClassesMiddlewareOptions = {
    dragClass: "dragging",
    dropClass: "drop",
  },
) =>
  ((state) => {
    const { container } = state
    return {
      onDragStart: ({ dragElement, selectedElements }) => {
        if (selectedElements.length > 1) {
          selectedElements.forEach((el) => el.classList.add(dragClass))
        } else {
          dragElement?.classList?.add(dragClass)
        }
        selectedElements.forEach((e) => e.classList.remove(dropClass))
      },
      onDragEnd: ({ dragElement }) => {
        dragElement?.classList.remove(dragClass)
        container
          .querySelectorAll("." + dragClass)
          .forEach((e: Element) => e.classList.remove(dragClass))
      },
      onDrop: ({ selectedElements }) => {
        selectedElements.forEach((e) => e.classList.add(dropClass))
      },
    }
  }) as DragDropMiddleware

export default addClassesMiddleware
