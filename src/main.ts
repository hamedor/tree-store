import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { ModuleRegistry, ClientSideRowModelModule, TreeDataModule, ValidationModule, RowGroupingPanelModule, RenderApiModule, UndoRedoEditModule, TextEditorModule, NumberEditorModule } from 'ag-grid-enterprise'


ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule, ValidationModule, RowGroupingPanelModule, RenderApiModule, UndoRedoEditModule, TextEditorModule, NumberEditorModule])
createApp(App).mount('#app')
