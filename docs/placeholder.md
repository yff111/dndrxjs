# Placeholder

Uses a clone of the currently dragged element as indicator for the drop-position.

> [!WARNING]
> Does not work with `in` as DropPosition. Also using placeholder with multi-select is not recommended since it feels clunky due to glitches when hiding selected elements.

<script setup>
  import 'dndrxjs/dist/styles.css'
  import { defineClientComponent } from 'vitepress'

  const PlaceholderDemo = defineClientComponent(() => import('./placeholder-demo.vue'))
</script>

**Demo**

<PlaceholderDemo></PlaceholderDemo>

<<< ../src/placeholder/types.ts{ts}

<<< placeholder-demo.vue{vue}
