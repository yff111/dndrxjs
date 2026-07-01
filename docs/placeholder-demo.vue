<script lang="ts" setup>
import { createDragDrop } from 'superdrop'
import { reorderItems } from 'superdrop/utils'
import { onMounted, onUnmounted, ref } from 'vue'
import data from './data/MOCK_DATA_1000.json'

const items = ref<{ name: string, id: string }[]>(data.splice(0, 20))
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  const instance = createDragDrop(container.value!, {
    placeholder: true, // [!code highlight]
    addClasses: true,
    autoScroll: true,
    dragImage: { minElements: 1 },
    onDragEnd({ dragElements, dropElement, position }) {
      if (!dropElement)
        return
      const index = Number.parseInt(dropElement.getAttribute('data-index')!)
      const selectedItems = dragElements.map(
        e => items.value.find(item => item.id === e.getAttribute('data-id'))!,
      )
      if (position === 'after') {
        items.value = reorderItems(items.value, selectedItems, index + 1)
      }
      else if (position === 'before') {
        items.value = reorderItems(items.value, selectedItems, index)
      }
    },
  })
  onUnmounted(() => instance.destroy())
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
      >
        <img src="/handle.svg">
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
