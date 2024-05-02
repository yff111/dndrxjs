# Getting Started


Add Package 

```terminal
yarn add dnd-rxjs-ts

```

Import dependency

```js

import createDragDropObservable, { addClasses, indicator, autoScroll} from 'dnd-rxjs-ts'

const subscription = createDragDropObservable( { 
  container: containerElement,
  dragElementSelector: "[data-id]",
  dropElementSelector: "[data-id]",
  ...
}
)
// add middleware operators
.pipe(addClasses(), indicator(), autoScroll())
.subscribe(({type, dragElement, dropElement, selectedIds, position}) => {
    if(type === "DragOver") {
      // do things
    } else-if(type === "DragEnd") {
      // transformation **here**
    }
  }

// unsubscribe on u.e. unmount


```



::: code-group

<<< ../src/types.ts{ts}

::: 
