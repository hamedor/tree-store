<template>
  <div>
    <button @click="toggleEditMode">
      {{ isEditMode ? 'Режим: редактирование' : 'Режим: просмотр' }}
    </button>
    <div class="ag-theme-alpine" style="width: 100%; height: 600px;">
      <ag-grid-vue
          @grid-ready="onGridReady"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          :rowData="rowData"
          :treeData="true"
          :getDataPath="getDataPath"
          :groupDefaultExpanded="0"
          :suppressAutoColumn="true"
          :gridOptions="gridOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ThreeStore } from '../modules/TreeStore.ts'

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
    const path = parents.map(p => p.label)
    return {
      ...item,
      path,
      category: store.getChildren(item.id).length > 0 ? 'Группа' : 'Элемент',
    }
  })
})

const getDataPath = (data: any) => data.path

const columnDefs = ref([
  {
    field: 'id',
    headerName: '№ п/п',
    width: 100,
    flex: 0
  },
  {
    field: 'category',
    headerName: 'Категория',
    cellRenderer: 'agGroupCellRenderer',
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

          ePlus.addEventListener('click', (event) => {
            event.stopPropagation()
            store.addItem({
              id: Date.now(),
              parent: params.data.id,
              label: 'Новый элемент',
            })
            console.log(gridApi.value)
            gridApi.value?.setGridOption(rowData.value)


          })

          const eDelete = document.createElement('span')
          eDelete.innerText = ' ✕'
          eDelete.style.color = 'red'
          eDelete.style.cursor = 'pointer'
          eDelete.style.marginLeft = '8px'

          eDelete.addEventListener('click', (event) => {
            event.stopPropagation()
            store.removeItem(params.data.id)
            const newData = store.getAll()
            gridApi.value?.setGridOption("rowData", newData)
          })

          eIcons.appendChild(ePlus)
          eIcons.appendChild(eDelete)
          eDiv.appendChild(eIcons)
        }

        return eDiv
      }
    },
  },
  {
    headerName: 'Наименование',
    field: 'label',
  }
])

const gridOptions = {
  rowGroupPanelShow: 'never',
  groupDisplayType: 'custom',
}

const defaultColDef = ref({
  flex: 1,
})

function toggleEditMode() {
  isEditMode.value = !isEditMode.value
}

const gridApi = ref(null)

function onGridReady(params) {
  gridApi.value = params.api
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
