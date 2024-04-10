# Vertical List 

<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA_1000.json'

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/autoscroll'
import dragImageMiddleware  from './src/drag-image'
import { reorderItems }  from './src/utils'


const items = ref(data)
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  dropPositionFn: ({ target, from }) => 'around' ,
  onDragEnd: ({from, to, selectedElements, position}) => {
      const index = parseInt(to.getAttribute('data-index'))
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

<div ref='container' style='overflow: scroll; max-height: 400px; padding-right: 10px;'>
  <ul style="margin: 0">
      <li v-for='(item, index) in items' :key='item.id' :data-id='item.id' :data-index='index'  style='margin: 0;'>
        <span  >{{item.name}} </span>
    </li>
  </ul>
</div>

<style>
span:has(+ ul) { font-weight: bold; }
[draggable="true"], .dragging{ opacity: 0.5; }
[draggable="true"] { cursor: grabbing; }
li { cursor: grab; }
@keyframes drop {
  0% { background: #999; }
  100% { background: #fff; }
}
.drop { animation: drop .35s ease; }
</style>


**Output**

```js{4}

import useDragDrop from './dist'
import addClassesMiddleware  from './dist/add-classes'
import indicatorMiddleware  from './dist/indicator'
import autoScrollMiddleware  from './dist/autoscroll'

useDragDrop(containerElement, {
    onDragEnd: ({from, to, selectedIds, position}) => {
      // transformation here
    }
  },
  [ 
   addClassesMiddleware(),
   indicatorMiddleware(), 
   autoScrollMiddleware()]
)

```
