<script setup>
const props = defineProps({ node: Object, parent: String, level: Number })
const collapsed = defineModel({})
const toggle = id => (collapsed.value[id] = !collapsed.value[id])
</script>

<template>
  <ul v-if="node.children && node.children.length > 0" class="tree">
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
          <img src="/chevron.svg">
        </button>

        <slot :child="child" />
      </span>
      <tree
        v-if="!collapsed[child.id] && child.children && child.children.length"
        v-slot="{ child }"
        v-model="collapsed"
        :node="child"
        :level="level + 1"
        :parent="child.id"
      >
        <slot :child="child" />
      </tree>
    </li>
  </ul>
</template>
