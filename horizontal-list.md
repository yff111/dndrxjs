# Getting started


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA.json'
import './styles.css'

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { moveTreeNodesById }  from './src/utils'

const root = ref({id: "root", children: data})
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  vertical: false,
  dropPositionFn: ({ dragElement, dropElement }) =>  'around',
    onDrop: ({dragElement, dropElement, selectedElements, position}) => {
      const index = parseInt(dropElement.getAttribute('data-index'))
      const dropElementId = dropElement.getAttribute('data-id')
      const selectedIds = selectedElements.map((e) => e.getAttribute('data-id'))
      if (position === 'after'){
        moveTreeNodesById(root.value, 'root', selectedIds, index)
      } else if (position === 'before'){
        moveTreeNodesById(root.value, 'root', selectedIds, index)
      }
    }},[addClassesMiddleware(), indicatorMiddleware(), autoScrollMiddleware(), dragImageMiddleware({minElements: 1})])
})
</script>


**Demo**


<div ref='container' style='display: flex; overflow: auto; position: relative;'>
  <transition-group name="list">
    <div v-for="(item, index) in root.children" draggable="false" style='padding: 8px;'  :key='item.id' :data-index='index' :data-id='item.id' >
      <div style='min-width: 80px; height: 80px; white-space: nowrap; padding: 5px; font-size: 11px; line-height: 1; border-radius: 4px;  background: #fff; display: flex;  text-align: center; align-items: center; justify-content: center;  border: 1px solid black; '><span>{{item.name}}</span></div>
    </div>
  </transition-group>
</div>



**Output**

```js{4}

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'

useDragDrop(containerElement, {
  vertical: true,
    onDrop: ({dragElement, dropElement, selectedIds, position}) => {
      // transformation here
    }
  },
  [ 
   addClassesMiddleware(),
   indicatorMiddleware(), 
   autoScrollMiddleware()]
)

```
