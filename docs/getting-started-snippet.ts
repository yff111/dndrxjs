import createDragDropObservable, {
  addClasses,
  indicator,
  autoScroll,
  dragImage,
} from "dndrxjs"

const subscription = createDragDropObservable({
  container: document.querySelector(".some-container-element") as HTMLElement,
  dragElementSelector: "[data-id]",
  dropElementSelector: "[data-id]",
  handleSelector: ".handle",
  dropPositionFn: ({ dragElements, dropElement }) => "around",
  // ... more DragDropOptions
})
  // add optional middleware operators
  .pipe(
    // adds css classes to drag-, drop- and container-elements
    addClasses(),
    // adds drag drop indicator element while dragging
    indicator(),
    // lets you add a custom drag image that follows the mouse cursor
    dragImage(),
    // adds auto-scroll behavior when
    autoScroll(),
  )
  .subscribe(({ type, dragElements, dropElement, position }) => {
    if (type === "DragOver") {
      // do things on DragOver
    } else if (type === "DragEnd") {
      // do list transformation on "DragEnd"
    }
  })

// unsubscribe when component is unmounted to remove all event-listeners
subscription.unsubscribe()
