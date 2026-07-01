export interface DragImagePluginOptions {
  /**
   * Method that creates the drag image element.
   *
   * Defaults to: defaultCreateElementFn
   */
  createElement: (selectedElements: HTMLElement[]) => HTMLElement
  /**
   * Minium amount of elements required to use custom drag image instead of
   * browser default.
   *
   * Defaults to: 0
   */
  minElements: number
}
