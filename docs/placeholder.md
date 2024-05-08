# Placeholder

<script setup>
  import 'dndrxjs/dist/styles.css'
  import { defineClientComponent } from 'vitepress'

  const PlaceholderDemo = defineClientComponent(() => import('./placeholder-demo.vue'))
</script>


**Demo**

<PlaceholderDemo></PlaceholderDemo>


<<< ../src/placeholder/types.ts{ts}

<<< placeholder-demo.vue{vue}