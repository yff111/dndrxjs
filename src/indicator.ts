import { isWindow } from "./helpers"
import { DragDropMiddleware, DropPosition } from "./types"

export type GetIndicatorStyleFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  position: DropPosition,
  vertical: boolean,
  offset: number,
) => () => string

const defaultGetIndicatorStyleFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  position: DropPosition,
  vertical: boolean,
  offset: number,
) =>
  ({
    after: () =>
      vertical
        ? `width:${width}px; height:2px; top:${y + height - 1 + offset}px; left:${x}px; background: currentColor; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x + width - 1 + offset}px; background: currentColor; pointer-events: none; position: absolute;`,
    in: () =>
      `width:${width}px; height:${height}px; top:${y}px; left:${x}px; opacity: 0.15; border-radius: 5px; background: currentColor; pointer-events: none; position: absolute; max-width: 100%; max-height: 100%;`,
    before: () =>
      vertical
        ? `width:${width}px; height:2px; top:${y - 1 - offset}px; left:${x}px; background: currentColor; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x - 1 - offset}px; background: currentColor; pointer-events: none; position: absolute;`,
    none: () => "",
  })[position]

export type IndicatorClasses = Record<DropPosition | "all", string>
export const defaultIndicatorClasses: IndicatorClasses = {
  all: "indicator",
  after: "indicator-after",
  in: "indicator-in",
  before: "indicator-before",
  none: "",
}
const indicatorMiddleware = (options: {
  getIndicatorStyleFn: GetIndicatorStyleFn
  indicatorClasses: IndicatorClasses
  offset: number
}) =>
  ((state) => {
    const {
      getIndicatorStyleFn = defaultGetIndicatorStyleFn,
      indicatorClasses = defaultIndicatorClasses,
      offset = 0,
    } = options || {}
    let containerRect: { x: number; y: number } = { x: 0, y: 0 }
    const indicatorElement = document.createElement("div")
    const updateIndicator = (target: HTMLElement, position: DropPosition) => {
      const { x, y, width, height } = state.getRectCached(target)
      const styleAsString = getIndicatorStyleFn(
        x - containerRect.x,
        y - containerRect.y,
        width,
        height,
        position,
        state.vertical,
        offset,
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
    const addIndicatorToElement = (element: HTMLElement | Window) => {
      currentScrollContainer = element
      if (isWindow(element)) {
        document.body.appendChild(indicatorElement)
      } else {
        containerRect = element!.getBoundingClientRect()
        element!.style.position = "relative"
        element!.appendChild(indicatorElement)
      }
    }
    return {
      onDragStart: ({ scrollContainer }) => {
        addIndicatorToElement(scrollContainer!)
        indicatorElement.style.display = "none"
      },
      onDragOver: ({ dropElement, position, scrollContainer }) => {
        if (currentScrollContainer !== scrollContainer) {
          // change indicator element parent
          addIndicatorToElement(scrollContainer!)
        }
        updateIndicator(dropElement!, position!)
      },
      onDrop: stop,
      onDestroy: stop,
    }
  }) as DragDropMiddleware

export default indicatorMiddleware
