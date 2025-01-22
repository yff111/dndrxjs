# Tree

<script setup>
  import 'dndrxjs/dist/styles.css'
  import { defineClientComponent } from 'vitepress'

  const TreeDemo = defineClientComponent(() => {
    return import('./tree-demo.vue')
  })
</script>

**Demo**

<TreeDemo></TreeDemo>

::: code-group

<<< tree-demo.vue{vue}

:::
