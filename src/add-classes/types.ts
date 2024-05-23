export type AddClassesMiddlewareOptions = {
  /**
   * Class-name added to element while being dragged
   *
   * Defaults to: `drag`
   */
  dragClass: string
  /**
   * Class-name added to element while being dragged over
   *
   * Defaults to: `dragover`
   */
  dragOverClass: string
  /**
   * Class-name added to element when it is being dropped. This can be used
   * for a drop animations. It will be removed after `animationend`-event
   *
   * Defaults to: `drop`
   */
  dropClass: string
  /**
   * Class-name added to the current scrollable container class.
   *
   * Defaults to: `active`
   */
  activeContainerClass: string
}
