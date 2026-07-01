<script lang="ts" setup>
import { createDragDrop } from 'superdrop'
import { reorderItems } from 'superdrop/utils'

import { onMounted, onUnmounted, ref } from 'vue'
import COLORS from './data/MOCK_DATA_COLORS.json'
import { useSelectStuff } from './select-stuff'

const items = ref(COLORS.map(hex => ({ id: hex })))
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  const instance = createDragDrop(container.value!, {
    vertical: false,
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll('.selected')),
    addClasses: true,
    indicator: { offset: 3 },
    autoScroll: true,
    dragImage: { minElements: 1 },
    onDragEnd({ dragElements, dropElement, position }) {
      if (!dropElement)
        return
      const selectedItems = dragElements.map(
        e => items.value.find(item => item.id === e.getAttribute('data-id'))!,
      )
      const index = Number.parseInt(dropElement.getAttribute('data-index')!)
      if (position === 'after') {
        items.value = reorderItems(items.value, selectedItems, index + 1)
      }
      else if (position === 'before') {
        items.value = reorderItems(items.value, selectedItems, index)
      }
    },
  })

  const { destroy } = useSelectStuff(container.value!, selected =>
    Array.from(container.value!.querySelectorAll('[data-id]')).forEach(el =>
      !selected.includes(el.getAttribute('data-id')!)
        ? el.classList.remove('selected')
        : el.classList.add('selected'),
    ))
  onUnmounted(() => {
    destroy()
    instance.destroy()
  })
})
</script>

<template>
  <div class="demo">
    <div
      ref="container"
      style="
        display: grid;
        grid: auto-flow/ repeat(10, 1fr);
        position: relative;
        gap: 6px;
      "
    >
      <div
        v-for="(item, index) in items"
        :key="item.id"
        draggable="false"
        style="
          height: 55px;
          padding: 5px;
          font-size: 11px;
          font-weight: bold;
          line-height: 1.25;
          cursor: grab;
          border-radius: 4px;
          display: flex;
          color: #fff;
          text-align: center;
          align-items: center;
          justify-content: center;
          background: #eee;
        "
        :style="{ background: item.id }"
        :data-index="index"
        :data-id="item.id"
      >
        <span>{{ item.id }}</span>
      </div>
    </div>
  </div>
</template>
