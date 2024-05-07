<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import createDragDropObservable, {
  dragImage,
  addClasses,
  indicator,
  autoScroll,
  reorderItems,
} from "dndrxjs"
import data from "./data/MOCK_DATA_1000.json"

const items = ref<{ name: string; id: string }[]>(data.splice(0, 300))
const container = ref<HTMLElement | null>(null)
const checked = ref<Record<string, boolean>>({})
onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    handleSelector: ".handle", // [!code highlight:3]
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll(`[data-selected="true"]`)),
    dropPositionFn: () => "around",
  })
    .pipe(
      addClasses(),
      indicator(),
      autoScroll(),
      dragImage({ minElements: 1 }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      if (!!dropElement && type === "DragEnd") {
        const index = parseInt(dropElement.getAttribute("data-index")!)
        const selectedItems = dragElements.map(
          (e) =>
            items.value.find((item) => item.id === e.getAttribute("data-id"))!,
        )
        if (position === "after") {
          items.value = reorderItems(items.value, selectedItems, index + 1)
        } else if (position === "before") {
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
            />
          </td>
          <td style="width: 0px">
            <input type="checkbox" v-model="checked[item.id]" />
          </td>
          <td style="width: 0px; text-align: center">{{ index + 1 }}</td>
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
