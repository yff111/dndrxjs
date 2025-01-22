<script lang="ts" setup>
import createDragDropObservable, {
  addClasses,
  autoScroll,
  dragImage,
  indicator,
  reorderItems,
} from 'dndrxjs'
import { onMounted, onUnmounted, ref } from 'vue'
import { fromHTML } from '../src/utils'
import data from './data/mock-data-persons.json'

const items = ref<{ name: string, avatar: string, id: string }[]>(data)
const container = ref<HTMLElement | null>(null)
const checked = ref<Record<string, boolean>>({})

onMounted(() => {
  // #region subscription
  const subscription = createDragDropObservable({
    container: container.value!,
    dropPositionFn: () => 'around',
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll(`[data-selected="true"]`)),
  })
    .pipe(
      addClasses(),
      indicator({ offset: 2 }),
      autoScroll(),
      dragImage({
        minElements: 0,
        updateElement: (selectedElements) => {
          const item
            = items.value[
              Number.parseInt(selectedElements[0].getAttribute('data-index')!)
            ]
          return fromHTML(
            `<div class='custom-drag-image' data-num='${selectedElements.length}'>
              <img class="avatar" src="${item.avatar}" />
              <span>
                ${item.name}
               <span>
              </div>`,
          )
        },
      }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      if (!!dropElement && type === 'DragEnd') {
        const index = Number.parseInt(dropElement.getAttribute('data-index')!)
        const selectedItems = dragElements.map(
          e =>
            items.value.find(item => item.id === e.getAttribute('data-id'))!,
        )
        if (position === 'after') {
          items.value = reorderItems(items.value, selectedItems, index + 1)
        }
        else if (position === 'before') {
          items.value = reorderItems(items.value, selectedItems, index)
        }
      }
    })
  // #endregion subscription
  onUnmounted(() => subscription.unsubscribe())
})
</script>

<template>
  <div
    ref="container"
    class="demo"
    style="overflow: auto; max-height: 400px; padding: 10px"
  >
    <ul class="list">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        :data-id="item.id"
        :data-index="index"
        class="list-item"
        style="margin-bottom: 4px"
        :data-selected="checked[item.id]"
        @click="checked[item.id] = !checked[item.id]"
      >
        <img src="/handle.svg">
        <input v-model="checked[item.id]" type="checkbox">
        <img class="avatar" :src="item.avatar">
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style type="text/css">
[data-selected="true"] {
  background: #eee !important;
}
.avatar {
  border-radius: 30px;
  overflow: hidden;
  width: 20px;
}

.custom-drag-image:not([data-num="1"]):after {
  content: attr(data-num);
  position: absolute;
  display: block;
  background: black;
  border-radius: 30px;
  color: #fff;
  min-width: 20px;
  line-height: 1;
  padding: 4px 3px;
  text-align: center;
  top: -10px;
  font-size: 12px;
  right: 10px;
}

.custom-drag-image {
  position: relative;
  background: #fff;
  padding: 6px 10px;
  margin: 10px;
  display: flex;
  box-shadow: 3px 3px 38px -15px rgba(0, 0, 0, 0.75);
  gap: 6px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  border-radius: 6px;
}
.custom-drag-image span {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 120px;
}
</style>
