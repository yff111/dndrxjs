<script lang="ts" setup>
import { createDragDrop } from 'superdrop'
import { reorderItems } from 'superdrop/utils'
import { onMounted, onUnmounted, ref } from 'vue'
import data from './data/MOCK_DATA_1000.json'

const items = ref<{ name: string, id: string }[]>(data)
const container = ref<HTMLElement | null>(null)
const checked = ref<Record<string, boolean>>({})

onMounted(() => {
  const instance = createDragDrop(container.value!, {
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll(`[data-selected="true"]`)),
    addClasses: true,
    indicator: {
      offset: 2,
      indicatorClasses: {
        initial: 'custom-indicator',
        vertical: 'custom-indicator-vertical',
        horizontal: 'custom-indicator-horizontal',
        after: 'custom-indicator-after',
        in: 'custom-indicator-in',
        before: 'custom-indicator-before',
      },
    },
    autoScroll: true,
    dragImage: true,
    onDragEnd({ dragElements, dropElement, position }) {
      if (!dropElement)
        return
      const index = Number.parseInt(dropElement.getAttribute('data-index')!)
      const selectedItems = dragElements.map(
        e => items.value.find(item => item.id === e.getAttribute('data-id'))!,
      )
      if (position === 'after') {
        items.value = reorderItems(items.value, selectedItems, index + 1)
      }
      else if (position === 'before') {
        items.value = reorderItems(items.value, selectedItems, index)
      }
    },
  })
  onUnmounted(() => instance.destroy())
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
        :data-selected="checked[item.id]"
        @click="checked[item.id] = !checked[item.id]"
      >
        <img src="/handle.svg">
        <input v-model="checked[item.id]" type="checkbox">
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style type="text/css">
.custom-indicator {
  color: purple;
  background: currentColor;
  pointer-events: none;
  position: absolute;
  display: none;
}

.custom-indicator-before,
.custom-indicator-after {
  display: block;
}

.custom-indicator-after:before,
.custom-indicator-before:before {
  width: 10px;
  height: 10px;
  content: "";
  display: block;
  border: 2px solid currentColor;
  border-radius: 10px;
  position: absolute;
  left: -10px;
  top: -4.5px;
}

.custom-indicator-after.custom-indicator-vertical {
  width: var(--indicator-w);
  height: 2px;
  top: calc(
    var(--indicator-y) + var(--indicator-h) - 1px + var(--indicator-offset)
  );
  left: var(--indicator-x);
}
.custom-indicator-after.custom-indicator-horizontal {
  height: var(--indicator-h);
  width: 2px;
  top: var(--indicator-y);
  left: calc(
    var(--indicator-x) + var(--indicator-w) - 1px + var(--indicator-offset)
  );
}
.custom-indicator-before.custom-indicator-horizontal {
  width: 2px;
  height: var(--indicator-h);
  left: calc(var(--indicator-x) - 1px - var(--indicator-offset));
  top: var(--indicator-y);
}
.custom-indicator-before.custom-indicator-vertical {
  width: var(--indicator-w);
  height: 2px;
  top: calc(var(--indicator-y) - 1px - var(--indicator-offset));
  left: var(--indicator-x);
}
</style>
