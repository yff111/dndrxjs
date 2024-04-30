import { GetElementIdFn, GetRectFn, Rect } from "./types"

export type TreeNode<T> = {
  id: string
  data: T
  parentId?: string
  children: TreeNode<T>[]
}
export type TreeNodeFlat<T> = {
  child: TreeNode<T>
  parent?: TreeNode<T>
  level: number
}
type TreeChildrenTupleFn = <T>(
  node: TreeNode<T>,
  level?: number,
) => [string, TreeNodeFlat<T>][]

export const moveTreeNodesById = <T>(
  root: TreeNode<T>,
  target: string,
  elements: string[],
  index: number = 0,
) => {
  const mapTreeChildrenToTuples: TreeChildrenTupleFn = <T>(
    node: TreeNode<T>,
    level: number = 0,
  ) =>
    node.children.flatMap<[string, TreeNodeFlat<T>]>((childNode) => [
      [childNode.id, { child: childNode, parent: node, level }],
      ...mapTreeChildrenToTuples(childNode, level + 1),
    ])

  const itemMap: Record<string, TreeNodeFlat<T>> = Object.fromEntries(
    mapTreeChildrenToTuples(root),
  )
  // adding root with parent undefined
  itemMap[root.id] = { child: root, parent: undefined, level: 0 }
  elements.forEach((id) => {
    const children = itemMap[id].parent!.children
    const localIndex = children.findIndex((item) => item.id === id)
    const isSameNode = children == itemMap[target].child.children
    children.splice(localIndex, 1)
    const corrector = isSameNode && localIndex < index ? -1 : 0
    itemMap[target].child.children.splice(
      index + corrector,
      0,
      itemMap[id].child,
    )
  })
}

export const reorderItems = <T = any>(
  source: T[],
  items: T[],
  targetIndex: number,
) => {
  const a: any[] = [...source]
  a.splice(targetIndex, 0, items)
  return a.filter((e) => items.indexOf(e) === -1).flatMap((e) => e) as T[]
}

export const swapElements = (
  array: Array<any>,
  index1: number,
  index2: number,
) => {
  array[index1] = array.splice(index2, 1, array[index1])[0]
}

export const moveItemsToArrayMutate = <T = any>(
  source: T[],
  target: T[],
  items: T[],
  targetIndex: number,
) => {
  const a: any[] = [...source]
  target = (target as Array<T | T[]>)
    .splice(targetIndex, 0, items)
    .flatMap((item) => item)
  return a.filter((e) => items.indexOf(e) === -1).flatMap((e) => e) as T[]
}

export const getListInfoFromElement = (e: Element) => ({
  id: e.getAttribute("data-id"),
  index: Number(e.getAttribute("data-index")),
})

export const getTreeInfoFromElement = (e: Element) => ({
  id: e.getAttribute("data-id"),
  parentId: e.getAttribute("data-parent-id"),
  index: Number(e.getAttribute("data-index")),
  hasChildren: e.getAttribute("data-has-children") === "true",
  level: Number(e.getAttribute("data-level")),
  expanded: e.getAttribute("data-expanded") === "true",
})

export const getRelativeRect = (
  element: HTMLElement,
  scrollContainer: HTMLElement | Window,
) => {
  const { width, height, x, y } = element.getBoundingClientRect()
  return {
    width,
    height,
    x: x + getScrollX(scrollContainer),
    y: y + getScrollY(scrollContainer),
  } as Rect
}

export const setAttributesTo = (
  selector: string,
  attribute: string,
  value: string,
  parent: HTMLElement = document.body,
) =>
  parent
    .querySelectorAll(selector)
    .forEach((e: Element) => e.setAttribute(attribute, value))

export let boundingRectCache: Record<
  string,
  { width: number; height: number; x: number; y: number }
> = {}

export const flushRectCache = () => {
  boundingRectCache = {}
}
export const getRectCached: GetRectFn = (
  element: HTMLElement,
  getElementIdLocal: GetElementIdFn,
  scrollContainer: HTMLElement,
) => {
  const id = getElementIdLocal(element)
  return (
    boundingRectCache[id!] ||
    (boundingRectCache[id!] = getRelativeRect(element, scrollContainer))
  )
}

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  let y = x2 - x1
  let x = y2 - y1
  return Math.sqrt(x * x + y * y)
}
export const fromHTML = (html: string) => {
  const template = document.createElement("template")
  template.innerHTML = html.trim()
  return template.content.children[0] as HTMLElement
}

export function isWindow(el: HTMLElement | Window | undefined): el is Window {
  return el instanceof Window
}
export const getScrollX = (container: HTMLElement | Window) =>
  isWindow(container) ? container.scrollX : container.scrollLeft

export const getScrollY = (container: HTMLElement | Window) =>
  isWindow(container) ? container.scrollY : container.scrollTop

export const getClosestScrollContainer = (element: HTMLElement) => {
  if (!element) {
    return window
  }
  let parent: HTMLElement = element
  while (parent) {
    const { overflow } = window.getComputedStyle(parent)
    if (overflow.split(" ").every((o) => o === "auto" || o === "scroll")) {
      return parent
    }
    parent = parent.parentElement!
  }

  return window
}
