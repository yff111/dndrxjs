import { getRelativeRect, isWindow } from "../utils"
import {
  DragDropPayload,
  DragDropMiddlewareHookMap,
  DragDropMiddlewareOperator,
  DropPosition,
} from "../types"
import { Observable, tap } from "rxjs"
import { IndicatorClasses, IndicatorMiddlewareOptions } from "./types"



export const defaultIndicatorClasses: IndicatorClasses = {
  initial: "indicator",
  vertical: "indicator-vertical",
  horizontal: "indicator-horizontal",
  after: "indicator-after",
  in: "indicator-in",
  before: "indicator-before",
  none: "",
}

export const DEFAULTS: IndicatorMiddlewareOptions = {
  indicatorClasses: defaultIndicatorClasses,
  offset: 0,
}

const indicatorMiddleware: DragDropMiddlewareOperator<
  IndicatorMiddlewareOptions
> = (options?) => {
  const { indicatorClasses, offset } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS
  let containerRect: { x: number; y: number } = { x: 0, y: 0 }
  const indicatorElement = document.createElement("div")
  const styleNode = document.createElement("style")

  const updateIndicator = (
    dropElement: HTMLElement,
    container: HTMLElement | Window,
    position: DropPosition,
    vertical: boolean,
  ) => {
    const { x, y, width, height } = getRelativeRect(dropElement, container)

    styleNode.innerHTML = `:root{
      --indicator-x: ${x - containerRect.x}px; 
      --indicator-y: ${y - containerRect.y}px;
      --indicator-w: ${width}px;
      --indicator-h: ${height}px;
      --indicator-offset: ${offset}px;
    }
    `
    console.log("updateIndicator", styleNode.innerHTML)

    // indicatorElement.setAttribute("style", styleAsString)
    indicatorElement.setAttribute(
      "class",
      `${indicatorClasses["initial"]} ${indicatorClasses[position]} ${indicatorClasses[vertical ? "vertical" : "horizontal"]}`,
    )
  }

  const stop = () => {
    indicatorElement.remove()
    styleNode.remove()
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
              document.head.appendChild(styleNode)
              addIndicatorToElement(scrollContainer!)
              // indicatorElement.style.display = "none"
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
