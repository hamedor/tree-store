export interface Item {
  id: number | string
  parent: number | string | null
  label: string
}

export class ThreeStore {
  constructor(private items: Item[]) {}

  getAll(): Item[] {
    return this.items
  }

  getItem(id: number | string): Item | undefined {
    return this.items.find(item => item.id === id)
  }

  getChildren(id: number | string): Item[] {
    return this.items.filter(item => item.parent === id)
  }

  getAllChildren(id: number | string): Item[] {
    const result: Item[] = []
    const collect = (parentId: number | string) => {
      const children = this.items.filter(item => item.parent === parentId)
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
    this.items.push(newItem)
  }

  removeItem(id: number | string): void {
    const item = this.getItem(id)
    if (!item) return
    const allToRemove = [item, ...this.getAllChildren(id)]
    this.items = this.items.filter(i => !allToRemove.includes(i))
  }

  updateItem(updated: Item): void {
    const index = this.items.findIndex(item => item.id === updated.id)
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updated }
    }
  }
}