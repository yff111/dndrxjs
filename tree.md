# Tree

<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA.json'

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/autoscroll'
import dragImageMiddleware  from './src/drag-image'
import { moveTreeNodesById }  from './src/utils'


const NestedList = defineComponent({
  name: 'nested-list', 
  props: { node: Object, parent: String, level: Number}, 
  template:`
    <ul v-if='node.children && node.children.length > 0' style="margin: 0">
      <li v-for='(child, index) in node.children' :key='child.id'  style='margin: 0;'>
        <span style='display: block' :data-index='index' :data-id='child.id' :data-level='level' :data-parent-id='parent' >{{child.name}}  <span v-if='child.children.length'>({{child.children.length}})</span></span>
        <nested-list v-if='child.children && child.children.length' :node='child' :level='level + 1' :parent='child.id'></nested-list>
      </li>
    </ul>`
})


const root = ref({id: "root", children: data})
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  dropPositionFn: ({ target, from }) => {
    const isDropElementParent =   !!target.parentElement.querySelector('ul li')
    const isOwnChild =   from.contains(target)
    const isDropElementNested = !!target.getAttribute('data-parent-id')
    return isOwnChild ? 'none' : isDropElementParent ? 'notAfter': 'all'
   } ,
    onDragEnd: ({from, to, selectedElements, position}) => {
      const index = parseInt(to.getAttribute('data-index'))
      const toId = to.getAttribute('data-id')
      const toParentId = to.getAttribute('data-parent-id') || 'root'
      const selectedIds = selectedElements.map((e) => e.getAttribute('data-id'))
      if(position == 'in') {
        moveTreeNodesById(root.value, toId, selectedIds, 0)
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
<nested-list :node='root' :level='0' ></nested-list>
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
