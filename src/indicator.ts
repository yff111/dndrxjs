import { DragDropMiddleware, DropPosition } from "./types"

export type GetIndicatorStyleFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  position: DropPosition,
  vertical: boolean,
) => () => string

const getIndicatorStyleFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  position: DropPosition,
  vertical: boolean,
) =>
  ({
    after: () =>
      vertical
        ? `width:${width}px; height:2px; top:${y + height - 1}px; left:${x}px; background: black; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x + width - 1}px; background: black; pointer-events: none; position: absolute;`,
    in: () =>
      `width:${width + 4}px; height:${height + 4}px; top:${y - 2}px; left:${x - 2}px; opacity: 0.15; border-radius: 5px; background: black; pointer-events: none; position: absolute;r`,
    before: () =>
      vertical
        ? `width:${width}px; height:2px; top:${y - 1}px; left:${x}px; background: black; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x - 1}px; background: black; pointer-events: none; position: absolute;`,
    none: () => "",
  })[position]

const indicatorMiddleware = (
  options: {
    getIndicatorStyleFn: GetIndicatorStyleFn
  } = { getIndicatorStyleFn },
) =>
  ((state) => {
    let containerRect: { x: number; y: number } = { x: 0, y: 0 }
    const indicatorElement = document.createElement("div")
    const updateIndicator = (target: HTMLElement, position: DropPosition) => {
      const { x, y, width, height } = state.getRectCached(target)
      const styleAsString = options.getIndicatorStyleFn(
        x - containerRect.x,
        y - containerRect.y,
        width,
        height,
        position,
        state.vertical,
      )()
      indicatorElement.setAttribute("style", styleAsString)
    }

    return {
      onDragStart: () => {
        if (state.scrollContainer instanceof Window) {
          document.body.appendChild(indicatorElement)
        } else {
          containerRect = state.scrollContainer.getBoundingClientRect()
          state.scrollContainer.style.position = "relative"
          state.scrollContainer.appendChild(indicatorElement)
        }
        indicatorElement.style.display = "none"
      },
      onDragOver: ({ dropElement, position }) =>
        updateIndicator(dropElement!, position!),
      onDragEnd: () => indicatorElement.remove(),
      onDrop: () => indicatorElement.remove(),
      onDestroy: () => indicatorElement.remove(),
    }
  }) as DragDropMiddleware

export default indicatorMiddleware
