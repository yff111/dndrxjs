# Getting Started


Add Package 

```terminal
yarn install dnd-rxjs-ts

```

Import dependency

```js{4}

import useDragDrop from 'dnd-rxjs-ts'
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
