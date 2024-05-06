<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import createDragDropObservable, {
  dragImage,
  addClasses,
  indicator,
  autoScroll,
  moveTreeNodesById,
} from "dndrxjs"
import { TreeNode } from "dndrxjs"

import data from "./data/MOCK_DATA.json"
const root = ref<TreeNode<string>>({ id: "root", children: data })
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    vertical: false, // [!code highlight]
    dropPositionFn: () => "around",
  })
    .pipe(
      addClasses(),
      indicator({ offset: 6 }),
      autoScroll(),
      dragImage({ minElements: 1 }),
    )
    .subscribe(({ type, dragElements, dropElement, position }) => {
      if (!!dropElement && type === "DragEnd") {
        const index = parseInt(dropElement.getAttribute("data-index")!)
        const selectedIds = dragElements.map((e) => e.getAttribute("data-id")!)
        if (position === "after") {
          moveTreeNodesById(root.value, "root", selectedIds, index + 1)
        } else if (position === "before") {
          moveTreeNodesById(root.value, "root", selectedIds, index)
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
      display: flex;
      overflow: auto;
      padding: 10px 10px;
      gap: 12px;
      position: relative;
    "
  >
    <transition-group name="list">
      <div
        v-for="(item, index) in root.children"
        draggable="false"
        :key="item.id"
        :data-index="index"
        :data-id="item.id"
      >
        <div
          class="list-item"
          style="min-width: 0; display: flex; flex-wrap: wrap; height: 100px"
        >
          <img src="/handle.svg" />
          <span style="white-space: nowrap">
            {{ item.data }}
          </span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.1s cubic-bezier(0.57, 0.03, 0.51, 0.94);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
