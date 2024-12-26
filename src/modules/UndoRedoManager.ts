import type { ThreeStore } from './TreeStore'

export type Action =
  | { type: 'cellEdit'; rowId: number | string; field: string; oldValue: any; newValue: any }
  | { type: 'add'; item: any }
  | { type: 'remove'; items: any[] }

export class UndoRedoManager {
  private undoStack: Action[] = []
  private redoStack: Action[] = []

  constructor(private store: ThreeStore, private gridApi: any) {}

  pushCellEdit(rowId: number | string, field: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return
    this.undoStack.push({
      type: 'cellEdit',
      rowId,
      field,
      oldValue,
      newValue,
    })
    this.redoStack = []
  }

  pushAdd(item: any) {
    this.undoStack.push({
      type: 'add',
      item,
    })
    this.redoStack = []
  }

  pushRemove(removedItems: any[]) {
    this.undoStack.push({
      type: 'remove',
      items: removedItems,
    })
    this.redoStack = []
  }


  undo() {
    if (this.undoStack.length === 0) return
    const action = this.undoStack.pop()!

    switch (action.type) {
      case 'cellEdit':
        this.store.updateItem({
          id: action.rowId,
          [action.field]: action.oldValue
        })
        this.redoStack.push(action)
        break

      case 'add':
        this.store.removeItem(action.item.id)
        this.redoStack.push(action)
        break

      case 'remove':
        action.items.forEach(item => {
          this.store.addItem(item)
        })
        this.redoStack.push(action)
        break
    }

    this.gridApi?.setGridOption("rowData", this.store.getAll())
  }

  redo() {
    if (this.redoStack.length === 0) return
    const action = this.redoStack.pop()!

    switch (action.type) {
      case 'cellEdit':
        this.store.updateItem({
          id: action.rowId,
          [action.field]: action.newValue
        })
        this.undoStack.push(action)
        break

      case 'add':
        this.store.addItem(action.item)
        this.undoStack.push(action)
        break

      case 'remove':
        action.items.forEach(item => {
          this.store.removeItem(item.id)
        })
        this.undoStack.push(action)
        break
    }

    this.gridApi?.setGridOption("rowData", this.store.getAll())
  }
}