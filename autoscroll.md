# Getting started


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA_COLORS.json'

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/autoscroll'
import dragImageMiddleware  from './src/drag-image'
import { moveTreeNodesById }  from './src/utils'

const root = ref({id: "root", children: data})
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  vertical: false,
  dropPositionFn: ({ target, from }) =>  'around',
    onDragEnd: ({from, to, selectedElements, position}) => {
      const index = parseInt(to.getAttribute('data-index'))
      const toId = to.getAttribute('data-id')
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

<div ref='container' style='overflow: scroll; max-height: 400px;  position: relative;'>
  <div  style='display: flex; flex-wrap: wrap; gap: 2px; width: calc((140px + 2px) * 10);'>
    <transition-group name="list">
      <div v-for="(item, index) in root.children" draggable="false"  :key='item.id' :data-index='index' :data-id='item.id' >
        <div style='width: 140px; height: 140px;  padding: 5px; font-size: 13px; border-radius: 4px; display: flex;  text-align: center; align-items: center; justify-content: center; font-weight: bold; color: #fff;' :style='{background: item.id}'><span>{{item.id}}</span></div>
      </div>
    </transition-group>
  </div>
</div>

<style>
  [draggable="true"], .dragging { opacity: 0.5; }
[draggable] {  cursor: grab; }
/* not working in chrome due to: https://issues.chromium.org/issues/40191172 */
[draggable="true"] {  cursor: grabbing!important; }

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s cubic-bezier(.57,.03,.51,.94);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

</style>


**Output**

```js{4}

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/autoscroll'

useDragDrop(containerElement, {
  vertical: true,
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
