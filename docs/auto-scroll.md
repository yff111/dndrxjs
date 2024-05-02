# Auto Scroll


<script setup>
  import './styles.css'
  import { defineClientComponent } from 'vitepress'

  const AutoScrollDemo = defineClientComponent(() => {
    return import('./auto-scroll-demo.vue')
  })
</script>


**Demo**

<AutoScrollDemo></AutoScrollDemo>



::: code-group

<<< auto-scroll-demo.vue{vue}

::: 
