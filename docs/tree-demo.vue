<script lang="ts" setup>
import type {
  TreeNode,
} from 'dndrxjs'
import createDragDropObservable, {
  addClasses,
  autoScroll,
  dragImage,
  indicator,
  moveTreeNodesById,
} from 'dndrxjs'
import { filter } from 'rxjs'

import { onMounted, onUnmounted, ref } from 'vue'

import Tree from './components/Tree.vue'
import data from './data/MOCK_DATA.json'

const root = ref<TreeNode<string>>({
  id: 'root',
  children: data,
})
const container = ref(null)
const collapsed = ref({})

onMounted(() => {
  const subscription = createDragDropObservable({
    container: container.value!,
    dropPositionFn: ({ dragElement, dropElement }) => {
      const isDropElementParent
        = !!dropElement.parentElement?.querySelector('ul li')
      const isOwnChild = dragElement.parentElement!.contains(dropElement)
      return isOwnChild ? 'none' : isDropElementParent ? 'notAfter' : 'all'
    },
  })
    .pipe(
      addClasses(),
      indicator({ offset: 0 }),
      autoScroll(),
      dragImage({ minElements: 1 }),
      filter(({ type, dropElement }) => !!dropElement && type === 'DragEnd'),
    )
    .subscribe(({ dropElement, dragElements, position }) => {
      const index = Number.parseInt(dropElement!.getAttribute('data-index') as string)
      const dropElementId = dropElement!.getAttribute('data-id')
      const dragElementParentId
        = dropElement!.getAttribute('data-parent-id') || 'root'
      const selectedIds = dragElements.map(e =>
        e.getAttribute('data-id'),
      ) as string[]
      if (position === 'in') {
        moveTreeNodesById(root.value, dropElementId!, selectedIds, 0)
      }
      else if (position === 'after') {
        moveTreeNodesById(
          root.value,
          dragElementParentId,
          selectedIds,
          index + 1,
        )
      }
      else if (position === 'before') {
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
    <Tree v-slot="{ child }" v-model="collapsed" :node="root" :level="0">
      <div>
        <div>
          {{ child.data }}
        </div>
      </div>
      <span v-if="child.children.length">({{ child.children.length }})</span>
    </Tree>
  </div>
</template>

<style>
ul.tree {
  list-style: none;
  padding-left: 0;
  margin: 0 !important;
}

ul.tree > li > span > button {
  position: absolute;
  left: 5px;
}
ul.tree > li.hasChildren > span {
  font-weight: bold;
}
ul.tree > li > span > button {
  transform: rotate(90deg);
}
ul.tree > li.collapsed > span > button {
  transform: rotate(0deg);
}
ul.tree > li > span {
  position: relative;
}
ul.tree li {
  margin: 0;
  list-style: none;
}

ul.tree > li > span {
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: grab;
  border-radius: 5px;
  padding: 5px 12px 5px 25px !important;
  /* color: var(--vp-c-text-1); */
}
ul.tree > li > span:hover {
  background: #f5f5f5;
}
ul.tree ul.tree {
  padding-left: 20px;
}
</style>
