<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import "./styles.css"

import createDragDropObservable, {
  dragImage,
  addClasses,
  indicator,
  autoScroll,
} from "../dist/"
import { swapElements } from "../dist/utils"
import COLORS from "./data/MOCK_DATA_COLORS.json"

const items = ref(COLORS.map((hex) => ({ id: hex })))
const container = ref<HTMLElement | null>(null)
onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    vertical: false,
    dropPositionFn: ({ dragElement, dropElement }) => "in",
  })
    .pipe(
      addClasses(),
      indicator({ offset: 3 }),
      autoScroll(),
      dragImage({ minElements: 0 }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      console.log("GridDemoSwap", type)
      if (type === "DragEnd" && !!dropElement) {
        const index1 = parseInt(dropElement.getAttribute("data-index")!)
        const index2 = parseInt(dragElements[0].getAttribute("data-index")!)
        if (position === "in") {
          swapElements(items.value, index1, index2)
        }
      }
    })

  onUnmounted(() => subscription.unsubscribe())
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
        :key="item.id"
        :data-index="index"
        :data-id="item.id"
      >
        <span>{{ item.id }}</span>
      </div>
    </div>
  </div>
</template>
