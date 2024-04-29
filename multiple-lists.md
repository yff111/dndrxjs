# Multiple Lists 

<script setup>
import {
  ref,
  shallowRef,
  triggerRef,
  watch,
  watchEffect,
  reactive,
  customRef,
  onMounted,
  toRef,
  computed,
  defineComponent,
} from "vue";
import data from "./MOCK_DATA.json";
import "./styles.css";

import useDragDrop from "./src/main";
import addClassesMiddleware from "./src/add-classes";
import indicatorMiddleware from "./src/indicator";
import autoScrollMiddleware from "./src/auto-scroll";
import dragImageMiddleware from "./src/drag-image";
import { moveTreeNodesById } from "./src/utils";

const container = ref(null);

const root = ref({
  id: "root",
  children: [
    {
      id: "a",
      children: [
        {
          id: "98",
          name: "Bactrospora Lichen",
          children: [],
        },
        { id: "99", name: "Suksdorfia", children: [] },
        { id: "100", name: "Cercipo", children: [] },
        { id: "35", name: "Largeleaf Phlox", children: [] },
        { id: "36", name: "Laurel Amarillo", children: [] },
        { id: "37", name: "Bruised Lichen", children: [] },
        { id: "38", name: "Grama", children: [] },
        { id: "39", name: "Chess-apple", children: [] },
        {
          id: "40",
          name: "Brandegee's Clarkia",
          children: [],
        },
        {
          id: "41",
          name: "Largeleaf Rose Gentian",
          children: [],
        },
        { id: "42", name: "Dirinaria Lichen", children: [] },
        { id: "43", name: "Bastard Cherry", children: [] },
      ],
    },
    {
      id: "b",
      children: [
        { id: "8", name: "Desert Wirelettuce", children: [] },
        { id: "9", name: "Whitetop", children: [] },
        { id: "10", name: "Rough Pricklypoppy", children: [] },
      ],
    },
    {
      id: "c",
      children: [],
    },
  ],
});

onMounted(() => {
  useDragDrop(
    container.value,
    {
      handleSelector: "[data-id]:not([data-has-children])",
      // containerSelector: "[data-has-children]",
      dragOverThrottle: 10,
      dropPositionFn: ({ dragElement, dropElement }) => {
        const isDropElementParent =
          dropElement.getAttribute("data-parent-id") === null;
        const isDropElementNested = dropElement.getAttribute("data-parent-id") !== null;
        const isOwnChild = dropElement.contains(dragElement);
        const hasChildren = dropElement.getAttribute('data-has-children') === "true";
        return isOwnChild  ? "in" : isDropElementParent ?
         "in"  : "around";
      },
    
    },
  ).pipe(
      addClassesMiddleware(),
      indicatorMiddleware({offset: 4}),
      autoScrollMiddleware(),
      dragImageMiddleware({ minElements: 0 }),
  ).subscribe(
    ({ type, dragElement, dropElement, dragElements, position }) => {
        if(!!dropElement && type === 'DragEnd'){
          const index = parseInt(dropElement.getAttribute("data-index"));
          const dropElementId = dropElement.getAttribute("data-id");
          const dropElementParentId = dropElement.getAttribute("data-parent-id") || "root";
          const selectedIds = dragElements.map((e) => e.getAttribute("data-id"))

          if (position == "in") {
            moveTreeNodesById(root.value, dropElementId, selectedIds, 0);
          } else if (position === "after") {
            moveTreeNodesById(root.value, dropElementParentId, selectedIds, index + 1);
          } else if (position === "before") {
            moveTreeNodesById(root.value, dropElementParentId, selectedIds, index);
          }
        }
      },
  )
});

</script>

<style>
.multi-list .active {
  border-color: #ccc!important;
}
</style>

**Demo**

<div ref='container' class='multi-list' style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px'>
  <div v-for='(row) in root.children' class='checkered' style='overflow-y: auto; box-sizing: border-box; max-height: 400px; min-height: 150px;  border-radius: 10px; padding: 8px; ' :data-id='row.id' :data-has-children='row.children.length > 0'>
    <ul class='list'>
        <li v-for='(item, index) in row.children' :key='item.id' :data-id='item.id' :data-index='index' :data-parent-id='row.id' style='margin-bottom: 8px;'>
          <span style=' min-height: 80px; background: #e79bff; color: #fff;' >{{item.name}}</span>
      </li>
    </ul>
  </div>
</div>

**Code**

```js{4}


```
