import { getRelativeRect, isWindow } from "../utils"
import {
  DragDropPayload,
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DropPosition,
} from "../types"
import { Observable, tap } from "rxjs"
import { IndicatorClasses, IndicatorMiddlewareOptions } from "./types"

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
      `width:${width}px; height:${height}px; top:${y}px; left:${x}px; border: 2.5px dashed currentColor; border-radius: 6px;  pointer-events: none; position: absolute; max-width: 100%; max-height: 100%;`,
    before: () =>
      vertical
        ? `width:${width}px; height:2px; top:${y - 1 - offset}px; left:${x}px; background: currentColor; pointer-events: none; position: absolute;`
        : `width: 2px; height:${height}px; top:${y}px; left:${x - 1 - offset}px; background: currentColor; pointer-events: none; position: absolute;`,
    none: () => "",
  })[position]

export const defaultIndicatorClasses: IndicatorClasses = {
  all: "indicator",
  after: "indicator-after",
  in: "indicator-in",
  before: "indicator-before",
  none: "",
}

export const DEFAULTS: IndicatorMiddlewareOptions = {
  getIndicatorStyleFn: defaultGetIndicatorStyleFn,
  indicatorClasses: defaultIndicatorClasses,
  offset: 0,
}

const indicatorMiddleware: DragDropMiddlewareOperator<
  IndicatorMiddlewareOptions
> = (options?) => {
  const { getIndicatorStyleFn, indicatorClasses, offset } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS
  let containerRect: { x: number; y: number } = { x: 0, y: 0 }
  const indicatorElement = document.createElement("div")
  const updateIndicator = (
    dropElement: HTMLElement,
    container: HTMLElement | Window,
    position: DropPosition,
    vertical: boolean,
  ) => {
    const { x, y, width, height } = getRelativeRect(dropElement, container)
    const styleAsString = getIndicatorStyleFn(
      x - containerRect.x,
      y - containerRect.y,
      width,
      height,
      position,
      vertical,
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
      containerRect = { x: 0, y: 0 }
      document.body.appendChild(indicatorElement)
    } else {
      containerRect = element!.getBoundingClientRect()
      element!.style.position = "relative"
      element!.appendChild(indicatorElement)
    }
  }
  return (source: Observable<DragDropPayload>) =>
    source.pipe(
      tap(({ type, scrollContainer, position, dropElement, options }) =>
        (
          ({
            DragStart: () => {
              addIndicatorToElement(scrollContainer!)
              indicatorElement.style.display = "none"
            },
            DragOver: () => {
              if (currentScrollContainer !== scrollContainer) {
                // change indicator element parent
                addIndicatorToElement(scrollContainer!)
              }
              updateIndicator(
                dropElement!,
                scrollContainer!,
                position!,
                !!options.vertical,
              )
            },
            DragEnd: stop,
          }) as DragDropMiddlewareHookMap
        )[type]?.(),
      ),
    )
}

export default indicatorMiddleware
