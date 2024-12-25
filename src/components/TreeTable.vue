<template>
  <div class="ag-theme-alpine" style="width: 100%; height: 600px;">
    <ag-grid-vue
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
      suppressCount: true
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

</script>

<style scoped>
.ag-theme-alpine div {
  height: 100%;
}
</style>
