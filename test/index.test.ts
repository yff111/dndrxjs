import { test } from "vitest"
import data from "../MOCK_DATA.json"

type TreeNode<T> = {
  id: string
  data: T
  parentId?: string
  children: TreeNode<T>[]
}

const mapChildren = <T>(node: TreeNode<T>) =>
  node.children.flatMap((child) => [
    [child.id, { child, parent: node }],
    ...mapChildren(child),
  ]) as any

//   const walkTree = <T>(node: TreeNode<T>, manipulate: (node: TreeNode<T>)  => void ) =>
//     node.children.forEach((child) => )

export const moveTreeNodesById = <T>(
  root: TreeNode<T>,
  target: TreeNode<T>,
  elements: TreeNode<T>[],
  index: number = 0,
) => {
  const itemMap = Object.fromEntries(mapChildren<T>(root))

  elements.forEach((e) => {
    const children = itemMap[e.id].parent.children
    const localIndex = children.indexOf(e.id)
    itemMap[e.id].parent.children.splice(localIndex, 0)
    // target.children.push(e)
    target.children = target.children.splice(index, 0, e)
  })

  console.log(itemMap)
  console.log(root)
  //   const a = [...array]
  //   a.splice(targetIndex, 0, elements)
  //   return a.filter((e) => elements.indexOf(e) === -1).flatMap((e) => e)
}

test("simple", () => {
  moveTreeNodesById({ id: "root", children: data.slice(0, 10) }, data[0], [
    data[6],
  ])
})
