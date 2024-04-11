# Grid


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import data from './MOCK_DATA_COLORS.json'
import './styles.css'

import useDragDrop from './src/main'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { reorderItems }  from './src/utils'

const container = ref(null)
const items = ref(Array.from(new Array(100)).map((item, index) => ({id: `${index}`})))
onMounted(() => {
  useDragDrop(container.value, {
  vertical: false,
  dropPositionFn: ({ dragElement, dropElement }) =>  'around',
    onDrop: ({dragElement, dropElement, selectedElements, position}) => {
      const index = parseInt(dropElement.getAttribute('data-index'))
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

**Demo**

<div ref='container' style='display: flex;  flex-wrap: wrap; position: relative;'>
  <transition-group name="list">
    <div v-for="(item, index) in items" draggable="false" style='padding: 1px;  width: calc((100% / 10) - 2px);'  :key='item.id' :data-index='index' :data-id='item.id' >
      <div style='width: 100%; height: 55px;  padding: 5px; font-size: 11px; font-weight: bold; line-height: 1.25; border-radius: 4px;  display: flex; color: #ccc; text-align: center; align-items: center; justify-content: center;  border: 2px solid transparent; background: #eee; ' :style='{colors: item.id}'><span>{{item.id}}</span></div>
    </div>
  </transition-group>
</div>

