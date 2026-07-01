import type { AddClassesMiddlewareOptions } from './add-classes/types'
import type { AutoScrollMiddlewareOptions } from './auto-scroll/types'
import type { DragImageMiddlewareOptions } from './drag-image/types'
import type { IndicatorMiddlewareOptions } from './indicator/types'
import type { PlaceholderMiddlewareOptions } from './placeholder/types'
import addClasses from './add-classes'
import autoScroll from './auto-scroll'
import dragImage from './drag-image'
import indicator from './indicator'
import createMouseDragDrop from './main'
import placeholder from './placeholder'
import { createTouchDragDrop, createUniversalDragDrop } from './touch'
import {
  DragDropEventType,
  DragDropInstance,
  DragDropOptions,
  DragDropPayload,
  DragDropPlugin,
  DropPosition,
  DropPositionFn,
  DropPositionRules,
  GetElementIdFn,
  GetRectFn,
  GetSelectedElementsFn,
  OnBeforeDragStartFn,
  OnDragStartFn,
  Rect,
} from './types'


export {
  DragDropEventType,
  DragDropInstance,
  DragDropOptions,
  DragDropPayload,
  DragDropPlugin,
  DropPosition,
  DropPositionFn,
  DropPositionRules,
  GetElementIdFn,
  GetRectFn,
  GetSelectedElementsFn,
  OnBeforeDragStartFn,
  OnDragStartFn,
  Rect,
}
export { addClasses, autoScroll, dragImage, indicator, placeholder }
export { createMouseDragDrop, createTouchDragDrop, createUniversalDragDrop }

export interface DragDropConfig extends Partial<Omit<DragDropOptions, 'container'>> {
  touch?: boolean
  addClasses?: boolean | Partial<AddClassesMiddlewareOptions>
  autoScroll?: boolean | Partial<AutoScrollMiddlewareOptions>
  indicator?: boolean | Partial<IndicatorMiddlewareOptions>
  dragImage?: boolean | Partial<DragImageMiddlewareOptions>
  placeholder?: boolean | Partial<PlaceholderMiddlewareOptions>
}

export function createDragDrop(container: HTMLElement, config: DragDropConfig = {}): DragDropInstance {
  const {
    touch = true,
    addClasses: addClassesOpt,
    autoScroll: autoScrollOpt,
    indicator: indicatorOpt,
    dragImage: dragImageOpt,
    placeholder: placeholderOpt,
    plugins: userPlugins = [],
    ...rest
  } = config

  const builtins: DragDropPlugin[] = []
  if (addClassesOpt)
    builtins.push(addClasses(addClassesOpt === true ? undefined : addClassesOpt))
  if (indicatorOpt)
    builtins.push(indicator(indicatorOpt === true ? undefined : indicatorOpt))
  if (placeholderOpt)
    builtins.push(placeholder(placeholderOpt === true ? undefined : placeholderOpt))
  if (autoScrollOpt)
    builtins.push(autoScroll(autoScrollOpt === true ? undefined : autoScrollOpt))
  if (dragImageOpt)
    builtins.push(dragImage(dragImageOpt === true ? undefined : dragImageOpt))

  const opts: Partial<DragDropOptions> = {
    ...rest,
    container,
    plugins: [...builtins, ...userPlugins],
  }

  if (!touch)
    return createMouseDragDrop(opts)
  return createUniversalDragDrop(opts)
}

export default createDragDrop
