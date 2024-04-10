<script setup>
defineProps({ node: Object, parent: String, level: Number })
</script>

<template>
  <ul v-if="node.children && node.children.length > 0" style="margin: 0">
    <li
      v-for="(child, index) in node.children"
      :key="child.id"
      style="margin: 0"
    >
      <span
        style="display: block"
        :data-index="index"
        :data-id="child.id"
        :data-level="level"
        :data-parent-id="parent"
        >{{ child.name }}
        <span v-if="child.children.length"
          >({{ child.children.length }})</span
        ></span
      >
      <tree
        v-if="child.children && child.children.length"
        :node="child"
        :level="level + 1"
        :parent="child.id"
      ></tree>
    </li>
  </ul>
</template>
