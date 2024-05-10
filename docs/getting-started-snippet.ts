import createDragDropObservable, {
  addClasses,
  indicator,
  autoScroll,
  dragImage,
} from "dndrxjs"

// provides a few basic styles for drop-animations etc.
import "dndrxjs/dist/styles.css"

const subscription = createDragDropObservable({
  // draggable element selector
  dragElementSelector: "[data-id]",
  // method that determines the drop-position
  dropPositionFn: ({ dragElement, dropElement }) => "around",
  // for more options @see `DragDropOptions`
})
  .pipe(
    // adds css classes to drag-, drop- and container-elements
    addClasses(),
    // adds drop position indicator while dragging
    indicator(),
    // adds custom drag image that follows the mouse cursor
    dragImage(),
    // adds auto-scroll behavior inside the closest scrollable container
    autoScroll(),
  )
  .subscribe(({ type, dragElements, dropElement, position }) => {
    if (type === "DragEnd") {
      // do list transformation on "DragEnd"
    }
  })

// unsubscribe when component is unmounted to remove all event-listeners
subscription.unsubscribe()
