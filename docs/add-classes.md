# Add Classes

Temporarily adds classes to the DOM elements involved in the drag & drop operation.

## Usage

```ts
import createDragDrop, { addClasses } from 'superdrop'

createDragDrop({
  container,
  plugins: [
    addClasses(), // uses default class names
    // or with custom class names:
    addClasses({
      dragClass: 'drag',
      dragOverClass: 'dragover',
      dropClass: 'drop',
      activeContainerClass: 'active',
    }),
  ],
})
```

## Types

::: code-group

<<< ../src/add-classes/types.ts{ts}

:::
