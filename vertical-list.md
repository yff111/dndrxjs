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
})
</script>

**Demo**

<div ref='container' style='overflow:auto; max-height: 400px; padding: 5px;'>
  <ul class='list'>
      <li v-for='(item, index) in items' :key='item.id' :data-id='item.id' :data-index='index' style='margin-bottom: 4px'>
        <span >{{item.name}}</span>
    </li>
  </ul>
</div>

**Output**

```js{4}


```
