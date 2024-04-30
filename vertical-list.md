# Vertical List 

<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, onUnmounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA_1000.json'
import './styles.css'

import createDragDropObservable from './src/main'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { reorderItems }  from './src/utils'


const items = ref(data)
const container = ref(null)

onMounted(() => {
  const subscription = createDragDropObservable( {
    container: container.value,
    dropPositionFn: ({ dragElement, dropElement }) => 'around',
  })
  .pipe(addClassesMiddleware(), indicatorMiddleware({offset: 2}), autoScrollMiddleware(), dragImageMiddleware({minElements: 0}))
  .subscribe(
    ({type, dragElements, dropElement, position}) => {
      if(!!dropElement && type === "DragEnd") {
        const index = parseInt(dropElement.getAttribute('data-index'))
      const selectedItems = dragElements.map((e) => items.value.find(item => item.id === e.getAttribute('data-id')))
      if (position === 'after'){
        items.value = reorderItems(items.value, selectedItems, index + 1)
      } else if (position === 'before'){
        items.value = reorderItems(items.value, selectedItems, index)
      }
    }
  })
  onUnmounted(()=> subscription.unsubscribe())

})
</script>

**Demo**

<div ref='container' class='demo' style='overflow:auto; max-height: 400px; padding: 10px;'>
  <ul class='list'>
      <li v-for='(item, index) in items' :key='item.id' :data-id='item.id' :data-index='index' class='list-item' style='margin-bottom: 4px'>
       <svg width="16px" height="16px" viewBox="0 0 0.3 0.3" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.11 0.092a0.022 0.022 0 1 0 0 -0.045 0.022 0.022 0 0 0 0 0.045m0.08 0a0.022 0.022 0 1 0 0 -0.045 0.022 0.022 0 0 0 0 0.045M0.212 0.15a0.022 0.022 0 1 1 -0.045 0 0.022 0.022 0 0 1 0.045 0M0.11 0.173a0.022 0.022 0 1 0 0 -0.045 0.022 0.022 0 0 0 0 0.045m0.103 0.058a0.022 0.022 0 1 1 -0.045 0 0.022 0.022 0 0 1 0.045 0M0.11 0.253a0.022 0.022 0 1 0 0 -0.045 0.022 0.022 0 0 0 0 0.045" fill="#000000"/></svg>
      <span>{{item.name}}</span>
    </li>
  </ul>
</div>

**Output**

```js


```
