<script lang="ts" setup>
import type { TreeNode,
} from 'dndrxjs'
import createDragDropObservable, {
  addClasses,
  autoScroll,
  dragImage,
  indicator,
  moveTreeNodesById,
} from 'dndrxjs'
import { onMounted, onUnmounted, ref } from 'vue'
import MOCK_TREE from './data/MOCK_TREE.json'

const container = ref(null)

const root = ref<TreeNode<string>>(MOCK_TREE)

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    handleSelector: '[data-id]:not([data-has-children])',
    dragOverThrottle: 10,
    dropPositionFn: ({ dragElement, dropElement }) => {
      const isDropElementParent
        = dropElement.getAttribute('data-parent-id') === null
      const isOwnChild = dropElement.contains(dragElement)
      return isOwnChild ? 'in' : isDropElementParent ? 'in' : 'around'
    },
  })
    .pipe(
      addClasses(),
      indicator({ offset: 0 }),
      autoScroll(),
      dragImage({ minElements: 1 }),
    )
    .subscribe(({ type, dropElement, dragElements, position }) => {
      if (!!dropElement && type === 'DragEnd') {
        const index = Number.parseInt(dropElement.getAttribute('data-index')!)
        const dropElementId = dropElement.getAttribute('data-id')!
        const dropElementParentId
          = dropElement.getAttribute('data-parent-id') || 'root'
        const selectedIds = dragElements.map(e => e.getAttribute('data-id')!)

        if (position === 'in') {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0)
        }
        else if (position === 'after') {
          moveTreeNodesById(
            root.value,
            dropElementParentId,
            selectedIds,
            index + 1,
          )
        }
        else if (position === 'before') {
          moveTreeNodesById(root.value, dropElementParentId, selectedIds, index)
        }
      }
    })

  onUnmounted(() => subscription.unsubscribe())
})
</script>

<template>
  <div
    ref="container"
    class="multi-list"
    style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px"
  >
    <div
      v-for="row in root.children"
      :key="row.id"
      class="demo"
      style="
        overflow-y: auto;
        box-sizing: border-box;
        max-height: 400px;
        min-height: 150px;
        border-radius: 10px;
        padding: 0;
      "
      :data-id="row.id"
      :data-has-children="row.children.length > 0"
    >
      <ul class="list">
        <li
          v-for="(item, index) in row.children"
          :key="item.id"
          :data-id="item.id"
          :data-index="index"
          :data-parent-id="row.id"
          style="margin: 0; padding: 5px; display: flex"
        >
          <span
            class="list-item"
            style="padding-top: 20px; padding-bottom: 20px; gap: 10px"
          >
            <img src="/handle.svg">
            <span style="">{{ item.data }}</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
