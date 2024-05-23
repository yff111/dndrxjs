export interface AutoScrollMiddlewareOptions {
  /**
   * Interval (in milliseconds)
   *
   * Defaults to: 8
   */
  interval: number
  /**
   * Steps (in pixels)
   *
   * Defaults to: 4
   */
  steps: number
  /**
   * Distance to the outer bounds of the scrollable container that triggers
   * auto-scrolling.
   *
   * Defaults to: 100
   */
  threshold: number
}
