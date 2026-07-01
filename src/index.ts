import type { AddClassesPluginOptions } from './add-classes/types'
import type { AutoScrollPluginOptions } from './auto-scroll/types'
import type { DragImagePluginOptions } from './drag-image/types'
import type { IndicatorPluginOptions } from './indicator/types'
import type { PlaceholderPluginOptions } from './placeholder/types'
import type { AnnouncerOptions } from './announcer'
import type { KeyboardDragDropOptions } from './keyboard'
import addClasses from './add-classes'
import autoScroll from './auto-scroll'
import dragImage from './drag-image'
import indicator from './indicator'
import placeholder from './placeholder'
import announcer from './announcer'
import createMouseDragDrop from './main'
import { createTouchDragDrop, createUniversalDragDrop } from './touch'
import { createKeyboardDragDrop } from './keyboard'
import {
  thresholdCollision,
  midpointCollision,
  edgeDistanceCollision,
} from './collision'
import {
  restrictToSameParent,
  restrictToSelector,
  excludeElements,
  restoreOnAbort,
} from './modifiers'
import {
  CollisionDetectionFn,
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
  CollisionDetectionFn,
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

// Plugins
export { addClasses, autoScroll, dragImage, indicator, placeholder, announcer }

// Factories
export { createMouseDragDrop, createTouchDragDrop, createUniversalDragDrop, createKeyboardDragDrop }

// Collision detection strategies
export { thresholdCollision, midpointCollision, edgeDistanceCollision }

// Position modifiers (dropPositionFn wrappers) + abort restore plugin
export { restrictToSameParent, restrictToSelector, excludeElements, restoreOnAbort }

export interface DragDropConfig extends Partial<Omit<DragDropOptions, 'container'>> {
  enableTouch?: boolean
  /** Add a keyboard sensor alongside mouse/touch. Pass `true` or options object. */
  enableKeyboard?: boolean | Omit<KeyboardDragDropOptions, keyof DragDropOptions>
  addClasses?: boolean | Partial<AddClassesPluginOptions>
  autoScroll?: boolean | Partial<AutoScrollPluginOptions>
  indicator?: boolean | Partial<IndicatorPluginOptions>
  dragImage?: boolean | Partial<DragImagePluginOptions>
  placeholder?: boolean | Partial<PlaceholderPluginOptions>
  /** Add a screen-reader announcer plugin. Pass `true` or options object. */
  announcer?: boolean | Partial<AnnouncerOptions>
}

export function createDragDrop(container: HTMLElement, config: DragDropConfig = {}): DragDropInstance {
  const {
    enableTouch = true,
    enableKeyboard = false,
    addClasses: addClassesOpt,
    autoScroll: autoScrollOpt,
    indicator: indicatorOpt,
    dragImage: dragImageOpt,
    placeholder: placeholderOpt,
    announcer: announcerOpt,
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
  if (announcerOpt)
    builtinPlugins.push(announcer(announcerOpt === true ? undefined : announcerOpt))

  const opts: Partial<DragDropOptions> = {
    ...rest,
    container,
    plugins: [...builtinPlugins, ...userPlugins],
  }

  const main = enableTouch
    ? createUniversalDragDrop(opts)
    : createMouseDragDrop(opts)

  if (!enableKeyboard) {
    return main
  }

  const keyboardOpts: KeyboardDragDropOptions = {
    ...opts,
    ...(enableKeyboard !== true ? enableKeyboard : {}),
  }
  const kb = createKeyboardDragDrop(keyboardOpts)

  return {
    destroy() {
      main.destroy()
      kb.destroy()
    },
  }
}

export default createDragDrop
