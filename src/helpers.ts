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

export const getScrollX = (container: HTMLElement | Window) =>
  container instanceof Window ? container.scrollX : container.scrollLeft

export const getScrollY = (container: HTMLElement | Window) =>
  container instanceof Window ? container.scrollY : container.scrollTop

export const getClosestScrollContainer = (element: HTMLElement) => {
  if (!element) {
    return document.documentElement
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
