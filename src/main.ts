import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { ModuleRegistry, ClientSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise'


ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule])
createApp(App).mount('#app')
