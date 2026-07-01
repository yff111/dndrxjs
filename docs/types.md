# Types

Core types used across the library.

- `DragDropOptions` — Configuration for `createDragDrop()`, including lifecycle callbacks and plugins
- `DragDropPayload` — The event payload passed to each callback and plugin hook
- `DragDropPlugin` — Type for creating custom plugins (`Partial<Record<DragDropEventType, (p: DragDropPayload) => void>>`)
- `DragDropInstance` — Returned by `createDragDrop()`; call `.destroy()` to remove all listeners
- `DropPosition` / `DropPositionRules` — Drop position values (`before`, `after`, `in`, `around`, etc.)
- `DragDropEventType` — Event lifecycle stages: `BeforeDragStart`, `DragStart`, `DragOver`, `DragEnd`

::: info
`DragAbort` is defined but currently not emitted by the library.
:::

::: code-group

<<< ../src/types.ts{ts}

:::
