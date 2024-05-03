<script lang="ts" setup>
import { filter } from "rxjs"
import { ref, onUnmounted, onMounted } from "vue"

import createDragDropObservable, {
  dragImage,
  addClasses,
  indicator,
  autoScroll,
  TreeNode,
  moveTreeNodesById,
} from "dndrxjs"

import data from "./data/MOCK_DATA.json"
import Tree from "./Tree.vue"

const root = ref<TreeNode<string>>({
  id: "root",
  children: data,
})
const container = ref(null)
const collapsed = ref({})

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    dropPositionFn: ({ dragElement, dropElement }) => {
      const isDropElementParent =
        !!dropElement.parentElement?.querySelector("ul li")
      const isOwnChild = dragElement.parentElement!.contains(dropElement)
      // const isDropElementNested = !!dropElement.getAttribute("data-parent-id")
      return isOwnChild ? "none" : isDropElementParent ? "notAfter" : "all"
    },
  })
    .pipe(
      addClasses(),
      indicator({ offset: 0 }),
      autoScroll(),
      dragImage({ minElements: 1 }),
      filter(({ type, dropElement }) => !!dropElement && type === "DragEnd"),
    )
    .subscribe(({ dropElement, dragElements, position }) => {
      const index = parseInt(dropElement!.getAttribute("data-index") as string)
      const dropElementId = dropElement!.getAttribute("data-id")
      const dragElementParentId =
        dropElement!.getAttribute("data-parent-id") || "root"
      const selectedIds = dragElements.map((e) =>
        e.getAttribute("data-id"),
      ) as string[]
      if (position === "in") {
        moveTreeNodesById(root.value, dropElementId!, selectedIds, 0)
      } else if (position === "after") {
        moveTreeNodesById(
          root.value,
          dragElementParentId,
          selectedIds,
          index + 1,
        )
      } else if (position === "before") {
        moveTreeNodesById<any>(
          root.value,
          dragElementParentId,
          selectedIds,
          index,
        )
      }
    })

  onUnmounted(() => subscription.unsubscribe())
})
</script>

<template>
  <div ref="container" class="demo">
    <Tree :node="root" v-model="collapsed" :level="0" v-slot="{ child }">
      {{ child.data }}
      <span v-if="child.children.length">({{ child.children.length }})</span>
    </Tree>
  </div>
</template>
