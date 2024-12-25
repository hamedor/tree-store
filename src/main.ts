import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { ModuleRegistry, ClientSideRowModelModule, TreeDataModule, ValidationModule, RowGroupingPanelModule, RenderApiModule } from 'ag-grid-enterprise'


ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule, ValidationModule, RowGroupingPanelModule, RenderApiModule])
createApp(App).mount('#app')
