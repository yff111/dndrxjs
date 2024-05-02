<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import data from "./data/MOCK_DATA_1000.json"
import createDragDropObservable, {
  dragImage,
  addClasses,
  indicator,
  autoScroll,
  reorderItems,
} from "../src"

const items = ref(data)
const container = ref(null)

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    dropPositionFn: ({ dragElement, dropElement }) => "around",
  })
    .pipe(
      addClasses(),
      indicator({ offset: 2 }),
      autoScroll(),
      dragImage({ minElements: 0 }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      if (!!dropElement && type === "DragEnd") {
        const index = parseInt(dropElement.getAttribute("data-index")!)
        const selectedItems = dragElements.map((e) =>
          items.value.find((item) => item.id === e.getAttribute("data-id")),
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
      >
        <img src="/handle.svg" />
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
