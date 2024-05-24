import { DropPosition } from "../types"

export type IndicatorMiddlewareOptions = {
  /**
   * Defaults to:
   * {
   *  initial: "indicator",
   *  vertical: "indicator-vertical",
   *  horizontal: "indicator-vertical",
   *  after: "indicator-after",
   *  in: "indicator-in",
   *  before: "indicator-before",
   * }
   */
  indicatorClasses: IndicatorClasses
  /**
   * Offset for the before and after.
   */
  offset: number
}

export type GetIndicatorStyleFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  position: DropPosition,
  vertical: boolean,
  offset: number,
) => () => string

export type IndicatorClasses = Record<
  DropPosition | "initial" | "vertical" | "horizontal",
  string
>
