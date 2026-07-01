/* eslint-disable unused-imports/no-unused-vars */
import createDragDrop from 'superdrop'

// provides a few basic styles for drop-animations etc.
// @ts-expect-error — CSS module, no types needed
import 'superdrop/dist/styles.css'

const instance = createDragDrop(document.getElementById('list')!, {
  // adds css classes to drag-, drop- and container-elements
  addClasses: true,
  // adds drop position indicator while dragging
  indicator: true,
  // adds custom drag image that follows the mouse cursor
  dragImage: true,
  // adds auto-scroll behavior inside the closest scrollable container
  autoScroll: true,
  onDragEnd({ dragElements, dropElement, position }) {
    // do list transformation on "DragEnd"
  },
  // for more options @see `DragDropConfig`
})

// call destroy() when the component is unmounted to remove all event-listeners
instance.destroy()
