# Indicator

Adds an absolutely positioned element to indicate the drop position of the dragged element.

<script setup>

import 'superdrop/dist/styles.css'
import { defineClientComponent } from 'vitepress'

const IndicatorDemo = defineClientComponent(() => {
  return import('./indicator-demo.vue')
})

</script>

## Demo

<IndicatorDemo></IndicatorDemo>

::: code-group

<<< indicator-demo.vue{vue}

:::

## Types

::: code-group

<<< ../src/indicator/types.ts{ts}

:::
