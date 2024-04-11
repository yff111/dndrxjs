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

import useDragDrop from "./src";
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
      handleSelector: "[data-id]",
      dragOverThrottle: 10,
      dropPositionFn: ({ dragElement, dropElement }) => {
        const isDropElementParent =
          dropElement.getAttribute("data-parent-id") === null;
        const isDropElementNested = dropElement.getAttribute("data-parent-id") !== null;
        const isOwnChild = dropElement.contains(dragElement);
        const hasChildren = dropElement.getAttribute('data-has-children') === "true";
        return isOwnChild || hasChildren ? "none" : isDropElementParent ? "in" : "around";
      },
      onDrop: ({ dragElement, dropElement, selectedElements, position }) => {
        const index = parseInt(dropElement.getAttribute("data-index"));
        const dropElementId = dropElement.getAttribute("data-id");
        const dropElementParentId = dropElement.getAttribute("data-parent-id") || "root";
        const selectedIds = selectedElements.map((e) =>
          e.getAttribute("data-id")
        );
        if (position == "in") {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0);
        } else if (position === "after") {
          moveTreeNodesById(root.value, dropElementParentId, selectedIds, index + 1);
        } else if (position === "before") {
          moveTreeNodesById(root.value, dropElementParentId, selectedIds, index);
        }
      },
    },
    [
      addClassesMiddleware(),
      indicatorMiddleware(),
      autoScrollMiddleware(),
      dragImageMiddleware({ minElements: 0 }),
    ]
  );
});

</script>

**Demo**

<div ref='container' style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px'>
  <div  v-for='(row) in root.children' style='overflow-x: none; overflow-y: auto; max-height: 200px; min-height: 150px; padding: 20px;  background: #f5f5f5; border-radius: 10px; padding: 10px;' :data-id='row.id' :data-has-children='row.children.length > 0'>
    <ul style="margin: 0px; padding: 0;">
        <li v-for='(item, index) in row.children' :key='item.id' :data-id='item.id' :data-index='index'  style='margin: 0; padding: 5px; list-style: none' :data-parent-id='row.id'>
          <span>{{item.name}} </span>
      </li>
    </ul>
  </div>
</div>

**Output**

```js{4}

import useDragDrop from './dist'
import addClassesMiddleware  from './dist/add-classes'
import indicatorMiddleware  from './dist/indicator'
import autoScrollMiddleware  from './dist/auto-scroll'

useDragDrop(containerElement, {
      handleSelector: "[data-id]",
      dragOverThrottle: 10,
      dropPositionFn: ({ dragElement, dropElement }) => {
        const isDropElementParent =
          dropElement.getAttribute("data-parent-id") === null;
        const isDropElementNested = dropElement.getAttribute("data-parent-id") !== null;
        const isOwnChild = dropElement.contains(dragElement);
        const hasChildren = dropElement.getAttribute('data-has-children') === "true";
        return isOwnChild || hasChildren ? "none" : isDropElementParent ? "in" : "around";
      },
      onDrop: ({ dragElement, dropElement, selectedElements, position }) => {
        const index = parseInt(dropElement.getAttribute("data-index"));
        const dropElementId = dropElement.getAttribute("data-id");
        const dropElementParentId = dropElement.getAttribute("data-parent-id") || "root";
        const selectedIds = selectedElements.map((e) =>
          e.getAttribute("data-id")
        );
        if (position == "in") {
          moveTreeNodesById(root.value, dropElementId, selectedIds, 0);
        } else if (position === "after") {
          moveTreeNodesById(root.value, dropElementParentId, selectedIds, index + 1);
        } else if (position === "before") {
          moveTreeNodesById(root.value, dropElementParentId, selectedIds, index);
        }
      },
    },
  [ 
   addClassesMiddleware(),
   indicatorMiddleware(), 
   autoScrollMiddleware()]
)

```
