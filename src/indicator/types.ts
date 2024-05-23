import { DropPosition } from "../types"

export type IndicatorMiddlewareOptions = {
  /**
   * Method that creates the indicator element.
   */
  getIndicatorStyleFn: GetIndicatorStyleFn
  /**
   * Defaults to: 
   * {
   *  all: "indicator",
   *  after: "indicator-after",
   *  in: "indicator-in",
   *  before: "indicator-before",
   *  none: "",
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

export type IndicatorClasses = Record<DropPosition | "all", string>
