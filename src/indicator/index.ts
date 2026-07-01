import type { DragDropPlugin, DropPosition } from '../types'
import type { IndicatorClasses, IndicatorPluginOptions } from './types'
import { getRelativeRect, isWindow } from '../utils'

export const defaultIndicatorClasses: IndicatorClasses = {
  initial: 'indicator',
  vertical: 'indicator-vertical',
  horizontal: 'indicator-horizontal',
  after: 'indicator-after',
  in: 'indicator-in',
  before: 'indicator-before',
}

export const DEFAULTS: IndicatorPluginOptions = {
  indicatorClasses: defaultIndicatorClasses,
  offset: 0,
}

function indicator(options?: Partial<IndicatorPluginOptions>): DragDropPlugin {
  const { indicatorClasses, offset } = options
    ? { ...DEFAULTS, ...options }
    : DEFAULTS

  let containerRect: { x: number, y: number } = { x: 0, y: 0 }
  const indicatorElement = document.createElement('div')
  indicatorElement.setAttribute('class', indicatorClasses.initial ?? '')
  const styleNode = document.createElement('style')

  let currentScrollContainer: HTMLElement | Window | null = null
  let savedPosition = ''

  const restorePosition = () => {
    if (currentScrollContainer && !isWindow(currentScrollContainer)) {
      (currentScrollContainer as HTMLElement).style.position = savedPosition
    }
  }

  const stop = () => {
    indicatorElement.remove()
    styleNode.remove()
    restorePosition()
  }

  const addIndicatorToElement = (element: HTMLElement | Window) => {
    restorePosition()
    currentScrollContainer = element
    if (isWindow(element)) {
      containerRect = { x: 0, y: 0 }
      document.body.appendChild(indicatorElement)
    }
    else {
      savedPosition = element.style.position
      containerRect = element.getBoundingClientRect()
      element.style.position = 'relative'
      element.appendChild(indicatorElement)
    }
  }

  const updateIndicator = (
    dropElement: HTMLElement,
    container: HTMLElement | Window,
    position: DropPosition,
    vertical: boolean,
  ) => {
    const { x, y, width, height } = getRelativeRect(dropElement, container)
    styleNode.innerHTML = `:root{--indicator-x:${x - containerRect.x}px;--indicator-y:${y - containerRect.y}px;--indicator-w:${width}px;--indicator-h:${height}px;--indicator-offset:${offset}px;}`
    indicatorElement.setAttribute(
      'class',
      `${indicatorClasses.initial} ${indicatorClasses[position]} ${indicatorClasses[vertical ? 'vertical' : 'horizontal']}`,
    )
  }

  return {
    DragStart({ scrollContainer }) {
      document.head.appendChild(styleNode)
      styleNode.innerHTML = ''
      addIndicatorToElement(scrollContainer)
    },
    DragOver({ scrollContainer, dropElement, position, options: opts }) {
      if (currentScrollContainer !== scrollContainer) {
        addIndicatorToElement(scrollContainer)
      }
      updateIndicator(dropElement!, scrollContainer, position!, !!opts.vertical)
    },
    DragEnd: stop,
  }
}

export { indicator }
export default indicator
