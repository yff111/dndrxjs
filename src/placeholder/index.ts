import type { DragDropPlugin } from '../types'
import type { PlaceholderMiddlewareOptions } from './types'

export function createSimplePlaceholder(dragElements: HTMLElement[]) {
  const tagName = dragElements[0].tagName
  const placeholderElement = document.createElement(tagName)
  placeholderElement.style.height = `${dragElements[0].getBoundingClientRect().height}px`
  return [placeholderElement]
}

export function createClonedPlaceholder(dragElements: HTMLElement[]) {
  const placeholderElements = dragElements.map(
    el => el.cloneNode(true) as HTMLElement,
  )
  placeholderElements.forEach((el) => {
    el.classList.add('placeholder')
    el.removeAttribute('data-id')
  })
  return placeholderElements.splice(0, 1)
}

export const DEFAULTS: PlaceholderMiddlewareOptions = {
  createElement: createClonedPlaceholder,
}

function placeholder(options?: Partial<PlaceholderMiddlewareOptions>): DragDropPlugin {
  const { createElement } = options ? { ...DEFAULTS, ...options } : DEFAULTS

  let placeholderElements: HTMLElement[]
  let dragStarted = false

  return {
    BeforeDragStart({ dragElements }) {
      placeholderElements = createElement(dragElements)
    },
    DragStart() {
      dragStarted = true
    },
    DragOver({ position, dragElements, dropElement }) {
      if (dragStarted) {
        dragStarted = false
        dragElements.forEach(el => (el.style.display = 'none'))
      }
      if (position === 'before') {
        placeholderElements
          .reverse()
          .forEach(el => dropElement?.parentNode?.insertBefore(el, dropElement))
      }
      else if (position === 'after') {
        placeholderElements
          .reverse()
          .forEach(el =>
            dropElement?.parentNode?.insertBefore(el, dropElement.nextSibling),
          )
      }
    },
    DragEnd({ dragElements }) {
      placeholderElements?.forEach(el => el.remove())
      dragElements.forEach(el => (el.style.display = ''))
    },
  }
}

export { placeholder }
export default placeholder
