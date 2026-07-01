import type { DragDropPlugin, DropPositionFn } from '../types'

/**
 * Wraps a `dropPositionFn` so that drops are only allowed when the drag
 * element and drop element share the same direct parent — preventing
 * cross-list drops without touching any other config.
 *
 * @example
 * createDragDrop(el, { dropPositionFn: restrictToSameParent() })
 */
export function restrictToSameParent(inner: DropPositionFn = () => 'around'): DropPositionFn {
  return ({ dragElement, dropElement }) => {
    if (dragElement.parentElement !== dropElement.parentElement)
      return 'none'
    return inner({ dragElement, dropElement })
  }
}

/**
 * Wraps a `dropPositionFn` so that drops are only allowed onto elements that
 * match `selector`. Non-matching elements are treated as position 'none'.
 *
 * @example
 * createDragDrop(el, { dropPositionFn: restrictToSelector('[data-accepts]') })
 */
export function restrictToSelector(selector: string, inner: DropPositionFn = () => 'around'): DropPositionFn {
  return ({ dragElement, dropElement }) => {
    if (!dropElement.matches(selector))
      return 'none'
    return inner({ dragElement, dropElement })
  }
}

/**
 * Wraps a `dropPositionFn` so that drops onto elements in `excluded` (or
 * matching an excluded selector string) always return 'none'.
 *
 * @example
 * createDragDrop(el, { dropPositionFn: excludeElements('.no-drop') })
 */
export function excludeElements(
  excluded: string | Element[],
  inner: DropPositionFn = () => 'around',
): DropPositionFn {
  return ({ dragElement, dropElement }) => {
    const blocked = typeof excluded === 'string'
      ? dropElement.matches(excluded)
      : excluded.includes(dropElement)
    if (blocked)
      return 'none'
    return inner({ dragElement, dropElement })
  }
}

/**
 * Plugin that captures each drag element's original DOM position at drag start
 * and restores it when the drag is cancelled with Escape.
 *
 * Use this when you perform live DOM reordering in `onDragOver` (without the
 * `placeholder` plugin) so that Escape snaps elements back to where they started.
 * The `placeholder` plugin has this behaviour built in and does not need this.
 *
 * @example
 * createDragDrop(el, { plugins: [restoreOnAbort()] })
 */
export function restoreOnAbort(): DragDropPlugin {
  interface SavedPosition {
    element: HTMLElement
    parent: ParentNode | null
    nextSibling: ChildNode | null
    display: string
  }
  let saved: SavedPosition[] = []

  return {
    BeforeDragStart({ dragElements }) {
      saved = dragElements.map(el => ({
        element: el,
        parent: el.parentNode,
        nextSibling: el.nextSibling,
        display: el.style.display,
      }))
    },
    DragAbort() {
      for (const { element, parent, nextSibling, display } of saved) {
        parent?.insertBefore(element, nextSibling)
        element.style.display = display
      }
      saved = []
    },
    DragEnd() {
      saved = []
    },
  }
}
