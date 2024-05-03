<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import createDragDropObservable, {
  dragImage,
  addClasses,
  indicator,
  autoScroll,
  reorderItems,
} from "dnd-rxjs-ts"
import COLORS from "./data/MOCK_DATA_COLORS.json"

const items = ref(COLORS.map((hex) => ({ id: hex })))
const container = ref(null)

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    vertical: false,
    dropPositionFn: ({ dragElement, dropElement }) => "around",
  })
    .pipe(
      addClasses(),
      indicator({ offset: 6 }),
      autoScroll(),
      dragImage({ minElements: 1 }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      if (!!dropElement && type === "DragEnd") {
        const index = parseInt(dropElement?.getAttribute("data-index") || "0")
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
  <div
    ref="container"
    class="demo"
    style="
      overflow: scroll;
      max-height: 420px;
      padding: 12px;
      position: relative;
    "
  >
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        width: calc((180px + 12px) * 10 - 12px);
      "
    >
      <div
        v-for="(item, index) in items"
        draggable="false"
        :key="item.id"
        :data-index="index"
        :data-id="item.id"
      >
        <div
          style="
            width: 180px;
            height: 180px;
            padding: 5px;
            font-size: 13px;
            border-radius: 4px;
            display: flex;
            text-align: center;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #fff;
          "
          :style="{ background: item.id }"
        >
          <span>{{ item.id }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
