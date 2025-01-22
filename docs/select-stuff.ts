export function unique<T>(array: readonly T[]): T[] {
  const valueMap = array.reduce(
    (acc, item) => {
      const key = item as any as string | number | symbol
      if (acc[key])
        return acc
      acc[key] = item
      return acc
    },
    {} as Record<string | number | symbol, T>,
  )
  return Object.values(valueMap)
}

export function toggle<T>(list: readonly T[], item: T) {
  if (!list && !item)
    return []
  if (!list)
    return [item]
  if (!item)
    return [...list]
  const matcher = (x: T) => x === item
  const existing = list.find(matcher)
  if (existing)
    return list.filter(x => !matcher(x))
  return [...list, item]
}

function toggleAllInbetween(selected: string[], all: string[], startId: string, endId: string) {
  const isStartValueSelected = selected.includes(startId)
  const startIndex = all.indexOf(startId)
  const endIndex = all.indexOf(endId)
  const range
    = startIndex < endIndex
      ? all.slice(startIndex, endIndex + 1)
      : all.slice(endIndex, startIndex)
  return !isStartValueSelected
    ? selected.filter(id => !range.includes(id))
    : unique([...selected, ...range])
}

export function useSelectStuff(container: HTMLElement, onUpdate: (selected: string[]) => any, selector: string = '[data-id]', getIdFromFn: (element: Element) => string = (element: Element) =>
  element.getAttribute('data-id')!) {
  let selected: string[] = []
  let lastSelectedId: string | undefined
  const modifiersState = { Shift: false, Meta: false, Alt: false }

  const getAll = () =>
    Array.from(container.querySelectorAll(`${selector}`) || []).map(getIdFromFn)

  const update = () => {
    Array.from(container.querySelectorAll(selector)).forEach(element =>
      selected.includes(getIdFromFn(element)),
    )
    onUpdate?.(selected)
  }
  const toggleSelect = (id: string) => {
    selected
      = modifiersState.Shift && !modifiersState.Meta && lastSelectedId
        ? toggleAllInbetween(selected, getAll(), lastSelectedId, id)
        : !modifiersState.Meta
            ? [id]
            : toggle(selected, id)
    lastSelectedId = id
    update()
  }

  const areAllItemsSelected = () =>
    selected.length > 0 && selected.length === getAll().length

  const toggleSelectAll = () => {
    selected = areAllItemsSelected() ? [] : getAll()
    update()
  }

  const selectAll = () => {
    selected = getAll()
    update()
  }
  const reset = (newValue: string[] = []) => {
    selected = newValue
    update()
  }

  const hasSelected = () => selected.length > 0

  const getSelectState = () =>
    selected.length === 0 ? 'none' : areAllItemsSelected() ? 'all' : 'partial'

  const getStuffFromMouseEvent = (e: MouseEvent) => {
    const element = (e.target as Element).closest(selector)
    return { element, id: element ? getIdFromFn(element) : undefined }
  }

  const onClickBody = (e: MouseEvent) =>
    !modifiersState.Shift && !(e.target as Element).closest(selector) && reset()
  document.addEventListener('click', onClickBody)

  const onClickContainer = (e: MouseEvent) => {
    const { element, id } = getStuffFromMouseEvent(e)
    if (element && id) {
      toggleSelect(id)
    }
    window.getSelection()?.empty()
  }
  container.addEventListener('click', onClickContainer)

  const updateModifiersState = (e: KeyboardEvent) => {
    modifiersState.Shift = e.getModifierState('Shift')
    modifiersState.Meta = e.getModifierState('Meta')
    modifiersState.Alt = e.getModifierState('Alt')
  }
  const onKeyUp = (e: KeyboardEvent) => updateModifiersState(e)
  document.addEventListener('keyup', onKeyUp)

  const onKeyDown = (e: KeyboardEvent) => {
    updateModifiersState(e)
    if (e.key === 'Escape')
      reset()
  }

  document.addEventListener('keydown', onKeyDown)

  const destroy = () => {
    document.removeEventListener('keyup', onKeyUp)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('click', onClickBody)
    container.removeEventListener('click', onClickContainer)
  }

  return {
    destroy,
    getSelectState,
    toggleSelectAll,
    selectAll,
    hasSelected,
    reset,
    toggleSelect,
  }
}
