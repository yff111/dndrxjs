# Getting started


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA.json'
import './styles.css'

import useDragDrop from './src/main'
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
    }).pipe(addClassesMiddleware(), indicatorMiddleware({offset: 6}), autoScrollMiddleware(), dragImageMiddleware({minElements: 1}))
    .subscribe(({type, dragElements, dropElement, selectedElements, position}) => {
      if(!!dropElement && type === 'DragEnd'){
        const index = parseInt(dropElement.getAttribute('data-index'))
        const dropElementId = dropElement.getAttribute('data-id')
        const selectedIds = dragElements.map((e) => e.getAttribute('data-id'))
        if (position === 'after'){
          moveTreeNodesById(root.value, 'root', selectedIds, index)
        } else if (position === 'before'){
          moveTreeNodesById(root.value, 'root', selectedIds, index)
        }
      }
    })
})
</script>


**Demo**


<div ref='container'  class='checkered' style='display: flex; overflow: auto;  padding: 10px 0; position: relative;'>
  <transition-group name="list">
    <div v-for="(item, index) in root.children" draggable="false"   :key='item.id' :data-index='index' :data-id='item.id' >
      <div style='min-width: 0;  display: flex;  height: 100px; margin-left: 15px; white-space: nowrap; padding: 20px; font-size: 12px; line-height: 1; border-radius: 4px;  background: #f5f5f5; color: #ccc; font-weight: bold; display: flex;  text-align: center; align-items: center; justify-content: center; '>{{item.name}}</div>
    </div>
  </transition-group>
</div>



