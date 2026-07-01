import type { DragDropPlugin, GetElementIdFn } from '../types'
import type { AddClassesPluginOptions } from './types'
import { isWindow } from '../utils'

export function addClassWhenAddedToDom(selectedElements: HTMLElement[], selector: string, cssClass: string, getElementId: GetElementIdFn, container: HTMLElement = document.body, timeout: number = 100) {
  const selectedElementIds = selectedElements.map(getElementId)
  const observer = new MutationObserver(mutations =>
    mutations.forEach(mutation =>
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          const newNodes = node.matches?.(selector)
            ? [node]
            : (Array.from(node.querySelectorAll(selector)) as HTMLElement[])
          newNodes.forEach((n) => {
            if (selectedElementIds.includes(getElementId(n))) {
              n.addEventListener(
                'animationend',
                () => n.classList.remove(cssClass),
                { once: true },
              )
              n.classList.add(cssClass)
            }
          })
        }
        observer.disconnect()
      }),
    ),
  )
  observer.observe(container, { childList: true, subtree: true })
  if (timeout)
    setTimeout(() => observer.disconnect(), timeout)
  return observer
}

export const DEFAULTS: AddClassesPluginOptions = {
  dragClass: 'drag',
  dragOverClass: 'dragover',
  dropClass: 'drop',
  activeContainerClass: 'active',
}

function addClasses(options?: Partial<AddClassesPluginOptions>): DragDropPlugin {
  const { dragClass, dropClass, dragOverClass, activeContainerClass } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  let prevScrollContainer: HTMLElement | Window | null = null
  let prevDragOverEl: HTMLElement | null = null

  const clear = (scrollContainer?: HTMLElement | Window) => {
    if (scrollContainer instanceof HTMLElement) {
      scrollContainer.classList.remove(activeContainerClass)
    }
    document.body.querySelectorAll(`.${dragClass}`).forEach((e: Element) => {
      e.classList.remove(dragClass)
    })
  }

  return {
    BeforeDragStart({ dragElements }) {
      dragElements.forEach(e => e.classList.remove(dropClass))
    },
    DragStart({ scrollContainer, dragElements }) {
      if (scrollContainer !== prevScrollContainer) {
        if (scrollContainer instanceof HTMLElement)
          scrollContainer.classList.add(activeContainerClass)
        if (prevScrollContainer instanceof HTMLElement)
          prevScrollContainer.classList.remove(activeContainerClass)
        prevScrollContainer = scrollContainer
      }
      dragElements.forEach(el => el.classList.add(dragClass))
    },
    DragOver({ scrollContainer, dropElement }) {
      if (scrollContainer !== prevScrollContainer) {
        if (scrollContainer instanceof HTMLElement)
          scrollContainer.classList.add(activeContainerClass)
        if (prevScrollContainer instanceof HTMLElement)
          prevScrollContainer.classList.remove(activeContainerClass)
        prevScrollContainer = scrollContainer
      }
      if (prevDragOverEl && prevDragOverEl !== dropElement)
        prevDragOverEl.classList.remove(dragOverClass)
      dropElement?.classList.add(dragOverClass)
      prevDragOverEl = dropElement ?? null
    },
    DragEnd({ scrollContainer, dragElements, options: opts }) {
      clear(scrollContainer)
      prevDragOverEl?.classList.remove(dragOverClass)
      prevDragOverEl = null
      prevScrollContainer = null
      addClassWhenAddedToDom(
        dragElements,
        opts.dragElementSelector,
        dropClass,
        opts.getElementId,
        isWindow(scrollContainer) ? document.body : scrollContainer,
      )
    },
  }
}

export { addClasses }
export default addClasses
