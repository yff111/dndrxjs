<script lang="ts" setup>
import createDragDropObservable, {
  addClasses,
  autoScroll,
  dragImage,
  indicator,
  reorderItems,
} from 'dndrxjs'
import { onMounted, onUnmounted, ref } from 'vue'
import data from './data/MOCK_DATA_1000.json'

const items = ref<{ name: string, id: string }[]>(data.splice(0, 300))
const container = ref<HTMLElement | null>(null)
const checked = ref<Record<string, boolean>>({})
onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    handleSelector: '.handle', // [!code highlight:3]
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll(`[data-selected="true"]`)),
    dropPositionFn: () => 'around',
  })
    .pipe(
      addClasses(),
      indicator(),
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
  <div ref="container" class="demo">
    <table style="width: 100%; display: table">
      <tbody>
        <tr
          v-for="(item, index) in items"
          :key="item.id"
          :data-id="item.id"
          :data-index="index"
          style="cursor: pointer"
          :data-selected="checked[item.id]"
          @click="checked[item.id] = !checked[item.id]"
        >
          <td class="handle" style="width: 0; cursor: grab">
            <img
              src="/handle.svg"
              style="pointer-events: none; max-width: 20px"
            >
          </td>
          <td style="width: 0px">
            <input v-model="checked[item.id]" type="checkbox">
          </td>
          <td style="width: 0px; text-align: center">
            {{ index + 1 }}
          </td>
          <td>
            <span>{{ item.name }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style type="text/css">
[data-id] {
  transition: box-shadow 0.1s ease !important;
}
.demo table td {
  background: #fff;
}
tr[data-selected="true"] td {
  background: #eee !important;
}
</style>
