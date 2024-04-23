# Getting Started


Add Package 

```terminal
yarn add dnd-rxjs-ts

```

Import dependency

```js{4}

import useDragDrop, {addClasses, indicator, autoScroll} from 'dnd-rxjs-ts'

useDragDrop(containerElement, { 
  dragElementSelector: "[data-id]",
  dropElementSelector: "[data-id]",
  ...
}
)
.pipe(addClasses(), indicator(), autoScroll())
.subscribe(({type, dragElement, dropElement, selectedIds, position}) => {
    if(type === "DragOver") {
      // to things
    } else-if(type === "DragEnd") {
      // transformation **here**
    }
  }

```
