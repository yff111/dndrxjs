# Getting Started


Add Package 

```terminal
yarn add dnd-rxjs-ts

```

Import dependency

```js{4}

import useDragDrop, {addClasses, indicator, autoScroll} from 'dnd-rxjs-ts'

useDragDrop(containerElement, {
    onDrop: ({dragElement, dropElement, selectedIds, position}) => {
      // transformation here
    }
  },
  [ 
   addClasses(),
   indicator(), 
   autoScroll()]
)

```
