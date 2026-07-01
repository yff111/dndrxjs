<script lang="ts" setup>
import { createDragDrop } from 'superdrop'
import { swapElements } from 'superdrop/utils'

import { onMounted, onUnmounted, ref } from 'vue'
import COLORS from './data/MOCK_DATA_COLORS.json'

const items = ref(COLORS.map(hex => ({ id: hex })))
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  const instance = createDragDrop(container.value!, {
    vertical: false,
    dropPositionFn: () => 'in',
    addClasses: true,
    indicator: { offset: 3 },
    autoScroll: true,
    dragImage: { minElements: 0 },
    onDragEnd({ dragElements, dropElement, position }) {
      if (!dropElement)
        return
      const index1 = Number.parseInt(dropElement.getAttribute('data-index')!)
      const index2 = Number.parseInt(dragElements[0].getAttribute('data-index')!)
      if (position === 'in') {
        swapElements(items.value, index1, index2)
      }
    },
  })

  onUnmounted(() => instance.destroy())
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
