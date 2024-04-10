# Grid


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA_COLORS.json'

import useDragDrop from './src'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/autoscroll'
import dragImageMiddleware  from './src/drag-image'
import { reorderItems }  from './src/utils'

const container = ref(null)
const items = ref(Array.from(new Array(100)).map((item, index) => ({id: `${index}`})))
onMounted(() => {
  useDragDrop(container.value, {
  vertical: false,
  dropPositionFn: ({ target, from }) =>  'around',
    onDragEnd: ({from, to, selectedElements, position}) => {
      const index = parseInt(to.getAttribute('data-index'))
      const selectedItems = selectedElements.map((e) => items.value.find(item => item.id === e.getAttribute('data-id')))
      if (position === 'after'){
        items.value = reorderItems(items.value, selectedItems, index)
      } else if (position === 'before'){
        items.value = reorderItems(items.value, selectedItems, index - 1)
      }
    }},[addClassesMiddleware(), indicatorMiddleware(), autoScrollMiddleware(), dragImageMiddleware({minElements: 1})])
})
</script>


<br>

<div ref='container' style='display: flex;  flex-wrap: wrap; position: relative;'>
  <transition-group name="list">
    <div v-for="(item, index) in items" draggable="false" style='padding: 1px;  width: calc((100% / 10) - 2px);'  :key='item.id' :data-index='index' :data-id='item.id' >
      <div style='width: 100%; height: 55px;  padding: 5px; font-size: 11px; font-weight: bold; line-height: 1.25; border-radius: 4px;  display: flex; color: #ccc; text-align: center; align-items: center; justify-content: center;  border: 2px solid transparent; background: #eee; ' :style='{colors: item.id}'><span>{{item.id}}</span></div>
    </div>
  </transition-group>
</div>

<style>
[draggable="true"], .dragging{ opacity: 0.5; }
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
