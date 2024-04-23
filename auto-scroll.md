# Getting started


<script setup>
import { ref, shallowRef, triggerRef, watch, watchEffect, reactive, customRef, onMounted, toRef, computed, defineComponent } from 'vue'
import './styles.css'

import useDragDrop from './src/main'
import addClassesMiddleware  from './src/add-classes'
import indicatorMiddleware  from './src/indicator'
import autoScrollMiddleware  from './src/auto-scroll'
import dragImageMiddleware  from './src/drag-image'
import { reorderItems }  from './src/utils'

const COLORS = [
"#ffe2f9","#ffe0f9","#ffdef9","#ffddf9","#ffdbf9","#ffd9f9","#ffd7f9","#ffd6f9","#ffd4f9","#ffd2f9","#ffd0f9","#ffcff9","#ffcdf9","#ffcbf9","#ffc9f9","#ffc8f9","#ffc6fa","#ffc4fa","#ffc2fa","#fec1fa","#febffa","#febdfa","#febcfb","#febafb","#fdb8fb","#fdb6fb","#fdb5fb","#fcb3fc","#fcb1fc","#fcaffc","#fbaefc","#fbacfd","#faaafd","#faa8fd","#faa7fd","#f9a5fe","#f9a3fe","#f8a1fe","#f8a0ff","#f79eff","#f799ff","#f699ff","#f499ff","#f399ff","#f29aff","#f09aff","#ef9aff","#ee9aff","#ec9aff","#eb9aff","#ea9bff","#e89bff","#e79bff","#e69bff","#e49bff","#e39bff","#e29bff","#e09cff","#df9cff","#de9cff","#dc9cff","#db9cff","#da9cff","#d89cff","#d79cff","#d69dff","#d49dff","#d39dff","#d29dff","#d09dff","#cf9dff","#ce9dff","#cc9dff","#cb9dff","#ca9eff","#c89eff","#c79eff","#c69eff","#c49eff","#c39eff"]

const items = ref(COLORS.map(hex => ({id: hex})))
const container = ref(null)

onMounted(() => {
  useDragDrop(container.value, {
  vertical: false,
  dropPositionFn: ({ dragElement, dropElement }) =>  'around',
     }).pipe(
      addClassesMiddleware(), 
      indicatorMiddleware({offset: 4 }), 
      autoScrollMiddleware(), 
      dragImageMiddleware({minElements: 1})
    ).subscribe(
       ({type, dragElements, dropElement,  position}) => {
        if(!!dropElement && type === 'DragEnd'){
          const index = parseInt(dropElement.getAttribute('data-index'))
          const selectedItems = dragElements.map((e) => items.value.find(item => item.id === e.getAttribute('data-id')))
          if (position === 'after'){
            items.value = reorderItems(items.value, selectedItems, index + 1)
          } else if (position === 'before'){
            items.value = reorderItems(items.value, selectedItems, index )
          }
        }
      }
    )
})
</script>


**Demo**

<div ref='container' style='overflow: scroll; max-height: 420px; padding: 6px; margin: -6px;  position: relative;'>
  <div  style='display: flex; flex-wrap: wrap; gap: 8px; width: calc((180px + 8px) * 10);'>
    <div v-for="(item, index) in items" draggable="false"  :key='item.id' :data-index='index' :data-id='item.id' >
      <div style='width: 180px; height: 180px;  padding: 5px; font-size: 13px; border-radius: 4px; display: flex;  text-align: center; align-items: center; justify-content: center; font-weight: bold; color: #fff;' :style='{background: item.id}'><span>{{item.id}}</span></div>
    </div>
  </div>
</div>


