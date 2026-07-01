import type { DragDropPlugin } from '../types'
import type { DragImagePluginOptions } from './types'
import { fromHTML } from '../utils'

function isTouchEvent(e: Event): e is TouchEvent {
  return typeof TouchEvent !== 'undefined' && e instanceof TouchEvent
}

export function defaultCreateElementFn(selectedElements: HTMLElement[]) {
  return fromHTML(
    `<div class='drag-image'>${selectedElements.length} Element(s)</div>`,
  )
}

export function updateContainerStyle(element: HTMLElement, top: number, left: number) {
  element.setAttribute(
    'style',
    `position: fixed; z-index: 9999; top: ${top}px; left:${left}px; pointer-events: none;`,
  )
}

export const DEFAULTS: DragImagePluginOptions = {
  createElement: defaultCreateElementFn,
  minElements: 0,
}

function dragImage(options?: Partial<DragImagePluginOptions>): DragDropPlugin {
  const { createElement, minElements } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  let removeListeners: (() => void) | null = null
  const customImageContainer = document.createElement('div')

  const blankDragImage = document.createElement('canvas')
  blankDragImage.width = blankDragImage.height = 1

  const stop = () => {
    removeListeners?.()
    removeListeners = null
    customImageContainer.remove()
    blankDragImage.remove()
  }

  const startDesktop = (originalEvent: DragEvent) => {
    document.body.appendChild(blankDragImage)
    originalEvent.dataTransfer?.setDragImage(blankDragImage, 0, 0)
    const onMove = (e: DragEvent) =>
      updateContainerStyle(customImageContainer, e.clientY, e.clientX)
    document.addEventListener('dragover', onMove)
    removeListeners = () => document.removeEventListener('dragover', onMove)
    updateContainerStyle(customImageContainer, originalEvent.clientY, originalEvent.clientX)
  }

  const startTouch = (originalEvent: TouchEvent) => {
    const t = originalEvent.touches[0]
    if (t)
      updateContainerStyle(customImageContainer, t.clientY, t.clientX)
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch)
        updateContainerStyle(customImageContainer, touch.clientY, touch.clientX)
    }
    document.addEventListener('touchmove', onMove)
    removeListeners = () => document.removeEventListener('touchmove', onMove)
  }

  return {
    DragStart({ originalEvent, dragElements }) {
      if (dragElements.length <= minElements)
        return
      customImageContainer.innerHTML = ''
      customImageContainer.appendChild(createElement(dragElements))
      document.body.appendChild(customImageContainer)
      if (isTouchEvent(originalEvent))
        startTouch(originalEvent)
      else startDesktop(originalEvent as DragEvent)
    },
    DragEnd: stop,
  }
}

export { dragImage }
export default dragImage
