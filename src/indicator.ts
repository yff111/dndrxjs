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
        ? `width:${width}px; height:2px; top:${y + height - 1}px; left:${x}px; background: currentColor; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x + width - 1}px; background: currentColor; pointer-events: none; position: absolute;`,
    in: () =>
      `width:${width}px; height:${height}px; top:${y}px; left:${x}px; opacity: 0.15; border-radius: 5px; background: currentColor; pointer-events: none; position: absolute; max-width: 100%; max-height: 100%;`,
    before: () =>
      vertical
        ? `width:${width}px; height:2px; top:${y - 1}px; left:${x}px; background: currentColor; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x - 1}px; background: currentColor; pointer-events: none; position: absolute;`,
    none: () => "",
  })[position]

export type IndicatorClassses = Record<DropPosition | "all", string>
export const indicatorClasses: IndicatorClassses = {
  all: "indicator",
  after: "indicator-after",
  in: "indicator-in",
  before: "indicator-before",
  none: "",
}
const indicatorMiddleware = (
  options: {
    getIndicatorStyleFn: GetIndicatorStyleFn
    indicatorClasses: IndicatorClassses
  } = { getIndicatorStyleFn, indicatorClasses },
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
      indicatorElement.setAttribute(
        "class",
        `${indicatorClasses["all"]} ${indicatorClasses[position]}`,
      )
    }

    const stop = () => {
      indicatorElement.remove()
    }

    let currentScrollContainer: HTMLElement | Window | null
    const addIndicatorToElement = (element: HTMLElement) => {
      currentScrollContainer = element
      containerRect = element!.getBoundingClientRect()
      element!.style.position = "relative"
      element!.appendChild(indicatorElement)
    }
    return {
      onDragStart: ({ scrollContainer }) => {
        if (scrollContainer instanceof Window) {
          document.body.appendChild(indicatorElement)
        } else {
          addIndicatorToElement(scrollContainer!)
        }
        indicatorElement.style.display = "none"
      },
      onDragOver: ({ dropElement, position, scrollContainer }) => {
        if (
          currentScrollContainer !== scrollContainer &&
          !(scrollContainer instanceof Window)
        ) {
          addIndicatorToElement(scrollContainer!)
        }
        updateIndicator(dropElement!, position!)
      },
      onDragEnd: stop,
      onDrop: stop,
      onDestroy: stop,
    }
  }) as DragDropMiddleware

export default indicatorMiddleware
