# Add Classes

Temporarily adds classes to the DOM-elements involved in the drag & drop operation.

### Usage

```ts
import createDragDropObservable, { addClasses } from 'dndrxjs'

createDragDropObservable({ container })
  .pipe(
    addClasses(), // uses default class names
    // or with custom class names:
    addClasses({
      dragClass: 'drag',
      dragOverClass: 'dragover',
      dropClass: 'drop',
      activeContainerClass: 'active',
    }),
  )
  .subscribe(/* ... */)
```

### Types

::: code-group

<<< ../src/add-classes/types.ts{ts}

:::
