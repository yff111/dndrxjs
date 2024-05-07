import { DropPosition } from "../types"

export type GetIndicatorStyleFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  position: DropPosition,
  vertical: boolean,
  offset: number,
) => () => string

export type IndicatorMiddlewareOptions = {
  getIndicatorStyleFn: GetIndicatorStyleFn
  indicatorClasses: IndicatorClasses
  offset: number
}

export type IndicatorClasses = Record<DropPosition | "all", string>
