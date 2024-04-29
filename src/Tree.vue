<script setup>
const props = defineProps({ node: Object, parent: String, level: Number })
const toggle = (id) => (collapsed.value[id] = !collapsed.value[id])
const collapsed = defineModel({})
</script>

<template>
  <ul class="tree" v-if="node.children && node.children.length > 0">
    <li
      v-for="(child, index) in node.children"
      :key="child.id"
      :class="{
        collapsed: collapsed[child.id],
        hasChildren: child.children.length > 0,
      }"
    >
      <span
        :data-index="index"
        :data-id="child.id"
        :data-level="level"
        :data-parent-id="parent"
        @click="child.children.length > 0 && toggle(child.id)"
      >
        <button v-if="child.children.length > 0">
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 14 14"
            xml:space="preserve"
            width="14"
            height="14"
          >
            <path
              style="
                fill: none;
                stroke: currentColor;
                stroke-width: 1.5;
                stroke-miterlimit: 10;
              "
              points="12.25,5 23.25,16 12.25,27 "
              d="m5.359 2.188 4.813 4.813 -4.813 4.813"
            />
          </svg>
        </button>
        <svg
          v-if="child.children.length > 0"
          width="16px"
          height="16px"
          viewBox="0 0 0.48 0.48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.44 0.381V0.181A0.04 0.04 0 0 0 0.4 0.141H0.265A0.046 0.046 0 0 1 0.23 0.119L0.211 0.083a0.046 0.046 0 0 0 -0.037 -0.023H0.08a0.04 0.04 0 0 0 -0.04 0.04v0.28A0.04 0.04 0 0 0 0.08 0.421h0.32A0.04 0.04 0 0 0 0.44 0.381"
            stroke="currentColor"
            stroke-width="0.04"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          width="16px"
          height="16px"
          viewBox="0 0 0.48 0.48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.08 0.08v0.32a0.04 0.04 0 0 0 0.04 0.04h0.24a0.04 0.04 0 0 0 0.04 -0.04V0.167a0.04 0.04 0 0 0 -0.012 -0.029l-0.089 -0.087A0.04 0.04 0 0 0 0.271 0.04H0.12a0.04 0.04 0 0 0 -0.04 0.04"
            stroke="currentColor"
            stroke-width="0.04"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M0.18 0.26h0.12"
            stroke="currentColor"
            stroke-width="0.04"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M0.18 0.34h0.06"
            stroke="currentColor"
            stroke-width="0.04"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M0.28 0.04v0.08a0.04 0.04 0 0 0 0.04 0.04h0.08"
            stroke="currentColor"
            stroke-width="0.04"
            stroke-linejoin="round"
          />
        </svg>
        {{ child.name }}
        <span v-if="child.children.length"
          >({{ child.children.length }})</span
        ></span
      >
      <tree
        v-model="collapsed"
        v-if="!collapsed[child.id] && child.children && child.children.length"
        :node="child"
        :level="level + 1"
        :parent="child.id"
      ></tree>
    </li>
  </ul>
</template>
