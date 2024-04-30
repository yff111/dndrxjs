# Getting started


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, onUnmounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA.json'
import './styles.css'

import createDragDropObservable from './src/main'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { moveTreeNodesById }  from './src/utils'

const root = ref({id: "root", children: data})
const container = ref(null)

onMounted(() => {
  const subscription = createDragDropObservable( {
    container: container.value,
  vertical: false,
  dropPositionFn: ({ dragElement, dropElement }) =>  'around',
    }).pipe(addClassesMiddleware(), indicatorMiddleware({offset: 6}), autoScrollMiddleware(), dragImageMiddleware({minElements: 1}))
    .subscribe(({type, dragElements, dropElement, selectedElements, position}) => {
      if(!!dropElement && type === 'DragEnd'){
        const index = parseInt(dropElement.getAttribute('data-index'))
        const dropElementId = dropElement.getAttribute('data-id')
        const selectedIds = dragElements.map((e) => e.getAttribute('data-id'))
        if (position === 'after'){
          moveTreeNodesById(root.value, 'root', selectedIds, index + 1)
        } else if (position === 'before'){
          moveTreeNodesById(root.value, 'root', selectedIds, index)
        }
      }
    })

  onUnmounted(()=> subscription.unsubscribe())

})
</script>


**Demo**

<div ref='container'  class='demo' style='display: flex; overflow: auto;  padding: 10px 10px;  gap: 12px; position: relative;'>
  <transition-group name="list">
    <div v-for="(item, index) in root.children" draggable="false" :key='item.id' :data-index='index' :data-id='item.id' >
      <div class='list-item' style='min-width: 0;  display: flex;  height: 100px;  white-space: nowrap; '>{{item.name}}</div>
    </div>
  </transition-group>
</div>



