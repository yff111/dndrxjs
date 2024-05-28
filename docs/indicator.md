# Indicator

Adds an absolute positioned element to indicate the drop position of the element.


<script setup>

import 'dndrxjs/dist/styles.css'
import { defineClientComponent } from 'vitepress'

const IndicatorDemo = defineClientComponent(() => {
  return import('./indicator-demo.vue')
})

  
</script>

<br>
<br>

#### Demo
<br>



<IndicatorDemo></IndicatorDemo>
<<< indicator-demo.vue{vue}

#### Types
<<< ../src/indicator/types.ts{ts}
