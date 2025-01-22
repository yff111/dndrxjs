<script lang="ts" setup>
import createDragDropObservable, {
  addClasses,
  autoScroll,
  dragImage,
  placeholder,
  reorderItems,
} from 'dndrxjs'
import { onMounted, onUnmounted, ref } from 'vue'
import data from './data/MOCK_DATA_1000.json'

const items = ref<{ name: string, id: string }[]>(data.splice(0, 20))
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    dropPositionFn: () => 'around',
  })
    .pipe(
      placeholder(), // [!code highlight]
      addClasses(),
      autoScroll(),
      dragImage({ minElements: 1 }),
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
      >
        <img src="/handle.svg">
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
