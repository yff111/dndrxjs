import { DragDropMiddleware } from "./types"

const ghostElementMiddleware: DragDropMiddleware = (state) => {
  const ghostElement = document.createElement("div")
  ghostElement.classList.add("ghost")

  return {
    onDragOver: ({ dragElement, position }) => {
      if (position === "before") {
        dragElement.before(ghostElement)
      } else if (position === "after") {
        dragElement.after(ghostElement)
      }
    },
    onDragStart: ({ dropElement, position }) => {
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
    onDestroy: () => ghostElement?.remove?.(),
  }
}

export default { ghostElementMiddleware }
