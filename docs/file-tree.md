# File-Tree

<script setup>
  import 'superdrop/dist/styles.css'
  import { defineClientComponent } from 'vitepress'

  const FileTreeDemo = defineClientComponent(() => {
    return import('./file-tree-demo.vue')
  })
</script>

**Demo**

<FileTreeDemo></FileTreeDemo>

::: code-group

<<< file-tree-demo.vue{vue}

:::
