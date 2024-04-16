# Vertical List 

<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA_1000.json'
import './styles.css'

import useDragDrop from './src/main'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { reorderItems }  from './src/utils'


const items = ref(data)
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  dropPositionFn: ({ dragElement, dropElement }) => 'around' ,
  onDrop: ({dragElement, dropElement, selectedElements, position}) => {
      if(!dropElement){
        return
      }
      const index = parseInt(dropElement.getAttribute('data-index'))
      const selectedItems = selectedElements.map((e) => items.value.find(item => item.id === e.getAttribute('data-id')))
      if (position === 'after'){
        items.value = reorderItems(items.value, selectedItems, index + 1)
      } else if (position === 'before'){
        items.value = reorderItems(items.value, selectedItems, index)
      }
  }},[addClassesMiddleware(), indicatorMiddleware(), autoScrollMiddleware(), dragImageMiddleware({minElements: 0})])
})
</script>

**Demo**

<div ref='container' style='overflow:auto; max-height: 400px; padding: 5px;'>
  <ul class='list'>
      <li v-for='(item, index) in items' :key='item.id'>
        <span :data-id='item.id' :data-index='index'>{{item.name}}</span>
    </li>
  </ul>
</div>

**Output**

```js{4}

import useDragDrop from './dist'
import addClassesMiddleware  from './dist/add-classes'
import indicatorMiddleware  from './dist/indicator'
import autoScrollMiddleware  from './dist/auto-scroll'

 useDragDrop(document.querySelector('.container'), {
  dropPositionFn: ({ dragElement, dropElement }) => 'around' ,
  onDrop: ({dragElement, dropElement, selectedElements, position}) => {
      const index = parseInt(dropElement.getAttribute('data-index'))
      const selectedItems = selectedElements.map((e) => items.value.find(item => item.id === e.getAttribute('data-id')))
      if (position === 'after'){
        items.value = reorderItems(items.value, selectedItems, index + 1)
      } else if (position === 'before'){
        items.value = reorderItems(items.value, selectedItems, index)
      }
  }},[addClassesMiddleware(), indicatorMiddleware(), autoScrollMiddleware(), dragImageMiddleware({minElements: 0})])

```
