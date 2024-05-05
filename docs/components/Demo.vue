<script lang="ts" setup></script>

<template>
  <div class="demo">
    <slot></slot>
  </div>
</template>

<style>
.demo {
  color: #000;
  max-height: 400px;
  outline: 1px solid #eee;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 12px;
  border-radius: 5px;
  background-color: #fff;
  background-image: linear-gradient(
      45deg,
      var(--squareColor) 25%,
      transparent 25%
    ),
    linear-gradient(135deg, var(--squareColor) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--squareColor) 75%),
    linear-gradient(135deg, transparent 75%, var(--squareColor) 75%);
  background-size: calc(2 * var(--squareSize)) calc(2 * var(--squareSize));
  background-position:
    0 0,
    var(--squareSize) 0,
    var(--squareSize) calc(-1 * var(--squareSize)),
    0 calc(-1 * var(--squareSize));
}
</style>
