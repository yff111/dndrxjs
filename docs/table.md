# Table

Table Demo with multi-select and custom drag-handle.

<script setup>
  import 'dndrxjs/dist/styles.css'
  import { defineClientComponent } from 'vitepress'

  const TableDemo = defineClientComponent(() => import('./table-demo.vue'))
</script>

**Demo**

<TableDemo></TableDemo>

::: code-group

<<< table-demo.vue{vue}

:::
