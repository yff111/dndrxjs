# Drag Image

Adds a custom drag image that follows the mouse cursor while dragging.



<script setup>

import 'dndrxjs/dist/styles.css'
import { defineClientComponent } from 'vitepress'

const DragImageDemo = defineClientComponent(() => {
  return import('./drag-image-demo.vue')
})

  
</script>

<br>
<br>

#### Demo
<br>



<DragImageDemo></DragImageDemo>
<<< drag-image-demo.vue{vue}

#### Types
<<< ../src/drag-image/types.ts{ts}
<<< ../src/drag-image/index.ts#defaults{ts}



