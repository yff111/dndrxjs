import type { DropPosition } from '../types'

export interface IndicatorPluginOptions {
  /**
   * Defaults to:
   * {
   *  initial: "indicator",
   *  vertical: "indicator-vertical",
   *  horizontal: "indicator-horizontal",
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

export type IndicatorClasses = Partial<
  Record<DropPosition | 'initial' | 'vertical' | 'horizontal', string>
>
