import type { AddClassesPluginOptions } from './add-classes/types'
import type { AutoScrollPluginOptions } from './auto-scroll/types'
import type { DragImagePluginOptions } from './drag-image/types'
import type { IndicatorPluginOptions } from './indicator/types'
import type { PlaceholderPluginOptions } from './placeholder/types'
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
  Rect,
}
export { addClasses, autoScroll, dragImage, indicator, placeholder }
export { createMouseDragDrop, createTouchDragDrop, createUniversalDragDrop }

export interface DragDropConfig extends Partial<Omit<DragDropOptions, 'container'>> {
  enableTouch?: boolean
  addClasses?: boolean | Partial<AddClassesPluginOptions>
  autoScroll?: boolean | Partial<AutoScrollPluginOptions>
  indicator?: boolean | Partial<IndicatorPluginOptions>
  dragImage?: boolean | Partial<DragImagePluginOptions>
  placeholder?: boolean | Partial<PlaceholderPluginOptions>
}

export function createDragDrop(container: HTMLElement, config: DragDropConfig = {}): DragDropInstance {
  const {
    enableTouch = true,
    addClasses: addClassesOpt,
    autoScroll: autoScrollOpt,
    indicator: indicatorOpt,
    dragImage: dragImageOpt,
    placeholder: placeholderOpt,
    plugins: userPlugins = [],
    ...rest
  } = config

  const builtinPlugins: DragDropPlugin[] = []
  if (addClassesOpt)
    builtinPlugins.push(addClasses(addClassesOpt === true ? undefined : addClassesOpt))
  if (indicatorOpt)
    builtinPlugins.push(indicator(indicatorOpt === true ? undefined : indicatorOpt))
  if (placeholderOpt)
    builtinPlugins.push(placeholder(placeholderOpt === true ? undefined : placeholderOpt))
  if (autoScrollOpt)
    builtinPlugins.push(autoScroll(autoScrollOpt === true ? undefined : autoScrollOpt))
  if (dragImageOpt)
    builtinPlugins.push(dragImage(dragImageOpt === true ? undefined : dragImageOpt))

  const opts: Partial<DragDropOptions> = {
    ...rest,
    container,
    plugins: [...builtinPlugins, ...userPlugins],
  }

  if (!enableTouch)
    return createMouseDragDrop(opts)
  return createUniversalDragDrop(opts)
}

export default createDragDrop
