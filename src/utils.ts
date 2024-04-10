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

const mapTreeChildrenToTuples: TreeChildrenTupleFn = <T>(
  node: TreeNode<T>,
  level: number = 0,
) =>
  node.children.flatMap<[string, TreeNodeFlat<T>]>((childNode) => [
    [childNode.id, { child: childNode, parent: node, level }],
    ...mapTreeChildrenToTuples(childNode, level + 1),
  ])

export const moveTreeNodesById = <T>(
  root: TreeNode<T>,
  target: string,
  elements: string[],
  index: number = 0,
) => {
  const itemMap: Record<string, TreeNodeFlat<T>> = Object.fromEntries(
    mapTreeChildrenToTuples(root),
  )
  // adding root with parent undefined
  itemMap[root.id] = { child: root, parent: undefined, level: 0 }
  elements.forEach((id) => {
    const children = itemMap[id].parent!.children
    const localIndex = children.findIndex((item) => item.id === id)
    children.splice(localIndex, 1)
    itemMap[target].child.children.splice(index, 0, itemMap[id].child)
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
