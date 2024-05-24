export interface DragImageMiddlewareOptions {
  /**
   * Method that updates the actual drag image,
   *
   * Defaults to: defaultUpdateElementFn
   */
  updateElement: (selectedElements: HTMLElement[]) => HTMLElement
  /**
   * Minium amount of elements required to use custom drag image instead of
   * browser default.
   *
   * Defaults to: 0
   */
  minElements: number
}
