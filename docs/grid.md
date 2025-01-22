# Grid

<script setup>

import 'dndrxjs/dist/styles.css'
import { defineClientComponent } from 'vitepress'

const GridDemo = defineClientComponent(() => {
  return import('./grid-demo.vue')
})
const GridDemoSwap = defineClientComponent(() => {
  return import('./grid-demo-swap.vue')
})

</script>

<br>
<br>

#### Sort
<br>

<GridDemo></GridDemo>

::: tip
Select multiple items by pressing `shift` or `alt`/`cmd`.
:::

::: code-group

<<< grid-demo.vue{vue}

:::

<br><br>

#### Swap
<br>
<GridDemoSwap></GridDemoSwap>

::: code-group

<<< grid-demo-swap.vue{vue}

:::
