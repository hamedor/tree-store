import { reactive } from 'vue'

export interface Item {
  id: number | string
  parent: number | string | null
  label: string
}

export class ThreeStore {
  private state: { items: Item[] }

  constructor(items: Item[]) {
    this.state = reactive({ items })
  }

  getAll(): Item[] {
    return this.state.items
  }

  getItem(id: number | string): Item | undefined {
    return this.state.items.find(item => item.id === id)
  }

  getChildren(id: number | string): Item[] {
    return this.state.items.filter(item => item.parent === id)
  }

  getAllChildren(id: number | string): Item[] {
    const result: Item[] = []
    const collect = (parentId: number | string) => {
      const children = this.state.items.filter(item => item.parent === parentId)
      for (const child of children) {
        result.push(child)
        collect(child.id)
      }
    }
    collect(id)
    return result
  }

  getAllParents(id: number | string): Item[] {
    const result: Item[] = []
    let current = this.getItem(id)
    while (current) {
      result.push(current)
      if (current.parent === null) break
      current = this.getItem(current.parent)
    }
    return result
  }

  addItem(newItem: Item): void {
    this.state.items.push(newItem)
  }

  removeItem(id: number | string): void {
    const item = this.getItem(id)
    if (!item) return
    const allToRemove = [item, ...this.getAllChildren(id)]

    this.state.items = this.state.items.filter(i => !allToRemove.includes(i))
  }

  updateItem(updated: Item): void {
    const index = this.state.items.findIndex(item => item.id === updated.id)
    if (index !== -1) {
      this.state.items[index] = { ...this.state.items[index], ...updated }
    }
  }
}