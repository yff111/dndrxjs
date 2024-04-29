# Tree

<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA.json'
import './styles.css'

import { filter } from 'rxjs'

import useDragDrop from './src/main'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { moveTreeNodesById }  from './src/utils'
import  Tree  from './src/Tree.vue'

const root = ref({id: "root", children: data})
const container = ref(null)
const collapsed = ref({})
onMounted(() => {
  useDragDrop(container.value, {
  dropPositionFn: ({ dragElement, dropElement }) => {
      const isDropElementParent =  !!dropElement.parentElement.querySelector('ul li')
      const isOwnChild = dragElement.parentElement.contains(dropElement)
      const isDropElementNested = !!dropElement.getAttribute('data-parent-id')
      return isOwnChild ? 'none' : isDropElementParent ? 'notAfter': 'all'
    },
   }
  )
  .pipe(
    addClassesMiddleware(), 
    indicatorMiddleware({offset: 0}), 
    autoScrollMiddleware(), 
    dragImageMiddleware({minElements: 1}),
    filter( ({type, dropElement}) => !!dropElement && type === 'DragEnd')
  )
  .subscribe(
    ({ dragElement, dropElement, dragElements, position}) => {
        const index = parseInt(dropElement.getAttribute('data-index'))
        const dropElementId = dropElement.getAttribute('data-id')
        const toParentId = dropElement.getAttribute('data-parent-id') || 'root'
        const selectedIds = dragElements.map((e) => e.getAttribute('data-id'))
        if(position == 'in') {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0)
        } else if (position === 'after'){
          moveTreeNodesById(root.value, toParentId, selectedIds, index + 1)
        } else if (position === 'before'){
          moveTreeNodesById(root.value, toParentId, selectedIds, index)
        }
      }
  )
})
</script>


**Demo**

<div ref='container' class='checkered' >
<tree :node='root' v-model='collapsed' :level='0' ></tree>
</div>

<style>

</style>




```ts

 useDragDrop(container.value, {
  dropPositionFn: ({ dragElement, dropElement }) => {
      const isDropElementParent =  !!dropElement.parentElement.querySelector('ul li')
      const isOwnChild = dragElement.parentElement.contains(dropElement)
      const isDropElementNested = !!dropElement.getAttribute('data-parent-id')
      return isOwnChild ? 'none' : isDropElementParent ? 'notAfter': 'all'
    },
   }
  )
  .pipe(
    addClassesMiddleware(), 
    indicatorMiddleware({offset: 0}), 
    autoScrollMiddleware(), 
    dragImageMiddleware({minElements: 1}),
    filter( ({type, dropElement}) => !!dropElement && type === 'DragEnd')
  )
  .subscribe(
    ({ dragElement, dropElement, dragElements, position}) => {
        const index = parseInt(dropElement.getAttribute('data-index'))
        const dropElementId = dropElement.getAttribute('data-id')
        const toParentId = dropElement.getAttribute('data-parent-id') || 'root'
        const selectedIds = dragElements.map((e) => e.getAttribute('data-id'))
        if(position == 'in') {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0)
        } else if (position === 'after'){
          moveTreeNodesById(root.value, toParentId, selectedIds, index + 1)
        } else if (position === 'before'){
          moveTreeNodesById(root.value, toParentId, selectedIds, index)
        }
      }
  )
```
