<script lang="ts" setup>
import createDragDropObservable, {
  addClasses,
  autoScroll,
  dragImage,
  indicator,
  reorderItems,
} from 'dndrxjs'

import { onMounted, onUnmounted, ref } from 'vue'
import COLORS from './data/MOCK_DATA_COLORS.json'
import { useSelectStuff } from './select-stuff'
import 'dndrxjs/dist/styles.css'

const items = ref(COLORS.map(hex => ({ id: hex })))
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  const subscription = createDragDropObservable({
    vertical: false,
    container: container.value!,
    dropPositionFn: ({ dragElement, dropElement }) => 'around',
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll('.selected')),
  })
    .pipe(
      addClasses(),
      indicator({ offset: 3 }),
      autoScroll(),
      dragImage({ minElements: 1 }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      if (type === 'DragEnd' && !!dropElement) {
        const selectedItems = dragElements.map(
          e =>
            items.value.find(item => item.id === e.getAttribute('data-id'))!,
        )
        const index = Number.parseInt(dropElement.getAttribute('data-index')!)
        if (position === 'after') {
          items.value = reorderItems(items.value, selectedItems, index + 1)
        }
        else if (position === 'before') {
          items.value = reorderItems(items.value, selectedItems, index)
        }
      }
    })

  const { destroy } = useSelectStuff(container.value!, selected =>
    Array.from(container.value!.querySelectorAll('[data-id]')).forEach(el =>
      !selected.includes(el.getAttribute('data-id')!)
        ? el.classList.remove('selected')
        : el.classList.add('selected'),
    ))
  onUnmounted(() => {
    destroy()
    subscription.unsubscribe()
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
