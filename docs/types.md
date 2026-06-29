# Types

Core types used across the library.

- `DragDropOptions` — Configuration for `createDragDropObservable()`
- `DragDropPayload` — The event payload emitted by the observable
- `DragDropMiddlewareOperator` — Type for creating custom middleware
- `DropPosition` / `DropPositionRules` — Drop position values (`before`, `after`, `in`, `around`, etc.)
- `DragDropEventType` — Event lifecycle stages: `BeforeDragStart`, `DragStart`, `DragOver`, `DragEnd`

::: info
`DragAbort` is defined but currently not emitted by the library.
:::

::: code-group

<<< ../src/types.ts{ts}

:::
