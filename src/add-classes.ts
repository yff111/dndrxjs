import { isWindow } from "./helpers"
import { DragDropMiddleware } from "./types"

export type AddClassesMiddlewareOptions = {
  dragClass: string
  dropClass: string
  dragOverClass: string
  activeContainerClass: string
}
const addClassesMiddleware = (
  {
    dragClass,
    dropClass,
    dragOverClass,
    activeContainerClass,
  }: AddClassesMiddlewareOptions = {
    dragClass: "drag",
    dragOverClass: "dragOver",
    dropClass: "drop",
    activeContainerClass: "active",
  },
) =>
  ((state, { targetSelector, getElementId }) => {
    const { container } = state
    const clear = (scrollContainer?: HTMLElement | Window) => {
      if (scrollContainer instanceof HTMLElement) {
        scrollContainer.classList.remove(activeContainerClass)
      }
      container
        .querySelectorAll("." + dragClass)
        .forEach((e: Element) => e.classList.remove(dragClass))
    }

    const clearDragOverClass = (currentDropElement?: HTMLElement) =>
      document
        .querySelectorAll(`.${dragOverClass}`)
        .forEach(
          (e) => e !== currentDropElement && e?.classList.remove(dragOverClass),
        )

    const addDropClassOnMutation = (
      selectedElements: HTMLElement[],
      scrollContainer?: HTMLElement | Window,
    ) => {
      const selectedElementIds = selectedElements.map(getElementId!)
      const observer = new MutationObserver((mutations) =>
        mutations.forEach((mutation) =>
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const newNodes = node.matches?.(targetSelector!)
                ? [node]
                : // check for matching child nodes if parent did not match
                  (Array.from(
                    node.querySelectorAll(targetSelector!),
                  ) as HTMLElement[])
              // match selected elements with added nodes
              newNodes.forEach(
                (n) =>
                  selectedElementIds.includes(getElementId!(n)) &&
                  n.classList.add(dropClass),
              )
            }
            observer.disconnect()
          }),
        ),
      )
      observer.observe(
        isWindow(scrollContainer) ? document.body : scrollContainer!,
        { childList: true, subtree: true },
      )
    }

    return {
      onDragOver: ({ dropElement }) => {
        clearDragOverClass(dropElement!)
        dropElement?.classList.add(dragOverClass)
      },
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
      onDrop: ({ scrollContainer, selectedElements }) => {
        clear(scrollContainer)
        clearDragOverClass()
        addDropClassOnMutation(selectedElements, scrollContainer)
      },
    }
  }) as DragDropMiddleware

export default addClassesMiddleware
