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
      indicator({
        offset: 2,
        indicatorClasses: {
          initial: "custom-indicator",
          vertical: "custom-indicator-vertical",
          horizontal: "custom-indicator-horizontal",
          after: "custom-indicator-after",
          in: "custom-indicator-in",
          before: "custom-indicator-before",
        },
      }),
      autoScroll(),
      dragImage(),
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
