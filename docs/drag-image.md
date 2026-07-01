# Drag Image

Adds a custom drag image that follows the mouse cursor while dragging.

<script setup>

import 'superdrop/dist/styles.css'
import { defineClientComponent } from 'vitepress'

const DragImageDemo = defineClientComponent(() => {
  return import('./drag-image-demo.vue')
})

</script>

## Demo

<DragImageDemo></DragImageDemo>

::: code-group

<<< drag-image-demo.vue{vue}

:::

## Types

::: code-group

<<< ../src/drag-image/types.ts{ts}
<<< ../src/drag-image/index.ts#defaults{ts}

:::
