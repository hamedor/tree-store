<template>
  <div>
    <button @click="toggleEditMode">
      {{ isEditMode ? 'Режим: редактирование' : 'Режим: просмотр' }}
    </button>
    <button @click="undo">Undo</button>
    <button @click="redo">Redo</button>

    <div class="ag-theme-alpine" style="width: 100%; height: 600px;">
      <ag-grid-vue
          @grid-ready="onGridReady"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          :rowData="rowData"
          :treeData="true"
          :getDataPath="getDataPath"
          :groupDefaultExpanded="-1"
          :suppressAutoColumn="true"
          :gridOptions="gridOptions"
          @cell-value-changed="onCellValueChanged"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ThreeStore } from '../modules/TreeStore'
import { UndoRedoManager } from '../modules/UndoRedoManager'

const store = new ThreeStore([
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: 2, parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: 2, label: 'Айтем 4' },
  { id: 5, parent: 2, label: 'Айтем 5' },
  { id: 6, parent: 2, label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
])

const isEditMode = ref(false)

const rowData = computed(() => {
  return store.getAll().map(item => {
    const parents = store.getAllParents(item.id).reverse()
    const path = parents.map((p) => `${p.label}__id${p.id}`)

    return {
      ...item,
      path,
      category: store.getChildren(item.id).length > 0 ? 'Группа' : 'Элемент',
    }
  })
})

const getDataPath = (data: any) => data.path || [data.id]

let undoRedoManager: UndoRedoManager | null = null

const columnDefs = ref([
  {
    field: 'id',
    headerName: '№ п/п',
    width: 100,
    flex: 0,
    editable: false,
  },
  {
    field: 'category',
    headerName: 'Категория',
    cellRenderer: 'agGroupCellRenderer',
    editable: false,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: (params) => {
        const value = params.value ?? ''
        const eDiv = document.createElement('div')
        eDiv.style.display = 'flex'
        eDiv.style.alignItems = 'center'
        eDiv.style.justifyContent = 'space-between'

        const eText = document.createElement('span')
        eText.innerText = value
        eDiv.appendChild(eText)

        if (isEditMode.value) {
          const eIcons = document.createElement('div')
          eIcons.style.display = 'flex'
          eIcons.style.alignItems = 'center'

          const ePlus = document.createElement('span')
          ePlus.innerText = ' +'
          ePlus.style.color = 'green'
          ePlus.style.cursor = 'pointer'
          ePlus.style.marginLeft = '8px'
          ePlus.addEventListener('click', () => {


            const newItem = {
              parent: params.data.id,
              label: 'Новый элемент',
            }
            store.addItem(newItem)
            undoRedoManager?.pushAdd(newItem)

            gridApi.value?.setGridOption("rowData", store.getAll())
          })

          const eDelete = document.createElement('span')
          eDelete.innerText = ' ✕'
          eDelete.style.color = 'red'
          eDelete.style.cursor = 'pointer'
          eDelete.style.marginLeft = '8px'
          eDelete.addEventListener('click', () => {
            const itemToRemove = store.getItem(params.data.id)
            if (!itemToRemove) return

            const allRemoved = [itemToRemove, ...store.getAllChildren(params.data.id)]
            store.removeItem(params.data.id)

            undoRedoManager?.pushRemove(allRemoved)
            gridApi.value?.setGridOption("rowData", store.getAll())
          })

          eIcons.appendChild(ePlus)
          eIcons.appendChild(eDelete)
          eDiv.appendChild(eIcons)
        }

        return eDiv
      }
    },
    flex: 1
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
    editable: (params) => isEditMode.value,
  }
])

const gridOptions = {
  rowGroupPanelShow: 'never',
  groupDisplayType: 'custom',
  undoRedoCellEditing: false,
}

const defaultColDef = ref({
  flex: 1,
})

function toggleEditMode() {
  isEditMode.value = !isEditMode.value
}

const gridApi = ref(null)

function onGridReady(params: any) {
  gridApi.value = params.api
  undoRedoManager = new UndoRedoManager(store, gridApi.value)
}

function undo() {
  undoRedoManager?.undo()
}
function redo() {
  undoRedoManager?.redo()
}

function onCellValueChanged(params: any) {
  const { data, oldValue, newValue, colDef } = params
  if (oldValue === newValue) return
  if (!undoRedoManager) return

  undoRedoManager.pushCellEdit(data.id, colDef.field, oldValue, newValue)

  store.updateItem({
    id: data.id,
    [colDef.field]: newValue
  })

  gridApi.value?.setGridOption("rowData", store.getAll())
}

watch(isEditMode, () => {
  gridApi.value?.refreshCells({ force: true })
})
</script>

<style scoped>
.ag-theme-alpine div {
  height: 100%;
}
</style>