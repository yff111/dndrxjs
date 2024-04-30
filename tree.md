# Tree

<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, onUnmounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA.json'
import './styles.css'

import { filter } from 'rxjs'

import createDragDropObservable from './src/main'
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
  const subscription = createDragDropObservable({
  container: container.value,
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
        const dragElementParentId = dropElement.getAttribute('data-parent-id') || 'root'
        const selectedIds = dragElements.map((e) => e.getAttribute('data-id'))
        console.log(dropElement, dragElements, index)
        if(position == 'in') {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0)
        } else if (position === 'after'){
          moveTreeNodesById(root.value, dragElementParentId, selectedIds, index + 1)
        } else if (position === 'before'){
          moveTreeNodesById(root.value, dragElementParentId, selectedIds, index )
        }
      }
  )

  onUnmounted(()=> subscription.unsubscribe())

})
</script>


**Demo**

<div ref='container' class='demo' >
<tree :node='root' v-model='collapsed' :level='0' ></tree>
</div>

<style>

</style>




```ts

 createDragDropObservable(container.value, {
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
        const dragElementParentId = dropElement.getAttribute('data-parent-id') || 'root'
        const selectedIds = dragElements.map((e) => e.getAttribute('data-id'))
        if(position == 'in') {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0)
        } else if (position === 'after'){
          moveTreeNodesById(root.value, dragElementParentId, selectedIds, index + 1)
        } else if (position === 'before'){
          moveTreeNodesById(root.value, dragElementParentId, selectedIds, index)
        }
      }
  )
```
