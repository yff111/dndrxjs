# Multiple Lists 

<script setup>
import './styles.css'
  import { defineClientComponent } from 'vitepress'

  const MultipleListsDemo = defineClientComponent(() => {
    return import('./multiple-lists-demo.vue')
  })
</script>


**Demo**


<MultipleListsDemo></MultipleListsDemo>



<style>
.multi-list .active {
  border-color: #ccc!important;
}
</style>

**Demo**


::: code-group

<<< multiple-lists-demo.vue{vue}

::: 