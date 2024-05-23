# Auto Scroll

Adds horizontal and vertical auto-scrolling for the closest scrollable container element.

<script setup>
  import 'dndrxjs/dist/styles.css'
  import { defineClientComponent } from 'vitepress'

  const AutoScrollDemo = defineClientComponent(() => {
    return import('./auto-scroll-demo.vue')
  })
</script>


**Demo**

<AutoScrollDemo></AutoScrollDemo>



<<< ../src/auto-scroll/types.ts{ts}


<<< auto-scroll-demo.vue{vue}

