# Getting Started


```js{4}

import useDragDrop from './dist'
import addClassesMiddleware  from './dist/add-classes'
import indicatorMiddleware  from './dist/indicator'
import autoScrollMiddleware  from './dist/auto-scroll'

useDragDrop(containerElement, {
    onDrop: ({dragElement, dropElement, selectedIds, position}) => {
      // transformation here
    }
  },
  [ 
   addClassesMiddleware(),
   indicatorMiddleware(), 
   autoScrollMiddleware()]
)

```
