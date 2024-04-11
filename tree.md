# Tree

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


import  Tree  from './src/Tree.vue'

const root = ref({id: "root", children: data})
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  dropPositionFn: ({ dragElement, dropElement }) => {
    const isDropElementParent =  !!dropElement.parentElement.querySelector('ul li')
    const isOwnChild = dragElement.parentElement.contains(dropElement)
    const isDropElementNested = !!dropElement.getAttribute('data-parent-id')
    return isOwnChild ? 'none' : isDropElementParent ? 'notAfter': 'all'
   },
  onDrop: ({dragElement, dropElement, selectedElements, position}) => {
    const index = parseInt(dropElement.getAttribute('data-index'))
    const dropElementId = dropElement.getAttribute('data-id')
    const toParentId = dropElement.getAttribute('data-parent-id') || 'root'
    const selectedIds = selectedElements.map((e) => e.getAttribute('data-id'))
    if(position == 'in') {
      moveTreeNodesById(root.value, dropElementId, selectedIds, 0)
    } else if (position === 'after'){
      moveTreeNodesById(root.value, toParentId, selectedIds, index + 1)
    } else if (position === 'before'){
      moveTreeNodesById(root.value, toParentId, selectedIds, index)
    }
  }},[addClassesMiddleware(), indicatorMiddleware(), autoScrollMiddleware(), dragImageMiddleware({minElements: 0})])
})
</script>


**Demo**

<div ref='container' >
<tree :node='root' :level='0' ></tree>
</div>

<style>

</style>


