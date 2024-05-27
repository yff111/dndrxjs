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
import { fromHTML } from "../src/utils"

const items = ref<{ name: string; id: string }[]>(data)
const container = ref<HTMLElement | null>(null)
const checked = ref<Record<string, boolean>>({})

onMounted(() => {
  //#region subscription
  const subscription = createDragDropObservable({
    container: container.value!,
    dropPositionFn: () => "around",
    getSelectedElements: () =>
      Array.from(container.value!.querySelectorAll(`[data-selected="true"]`)),
  })
    .pipe(
      addClasses(),
      indicator({ offset: 2 }),
      autoScroll(),
      dragImage({
        minElements: 0,
        updateElement: (selectedElements) =>
          fromHTML(
            `<div class='custom-drag-image' data-num='${selectedElements.length}'>
              <img src="/dndrxjs/smiley-white.svg" />
              <span>
                ${selectedElements[0].innerText}
               <span>
              </div>`,
          ),
      }),
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
  //#endregion subscription
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
        :data-selected="checked[item.id]"
        @click="checked[item.id] = !checked[item.id]"
      >
        <img src="/handle.svg" />
        <input type="checkbox" v-model="checked[item.id]" />
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style type="text/css">
[data-selected="true"] {
  background: #eee !important;
}

.custom-drag-image:after {
  content: attr(data-num);
  position: absolute;
  display: block;
  background: purple;
  border-radius: 30px;
  color: #fff;
  min-width: 20px;
  line-height: 1;
  padding: 4px 3px;
  text-align: center;
  top: -10px;
  right: 10px;
}

.custom-drag-image {
  position: relative;
  background: #fff;
  padding: 6px 10px;
  margin: 10px;
  display: flex;
  box-shadow: 3px 3px 38px -15px rgba(0, 0, 0, 0.75);
  gap: 6px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  border-radius: 6px;
}
.custom-drag-image span {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 120px;
}
</style>
