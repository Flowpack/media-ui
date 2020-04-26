import manifest from '@neos-project/neos-ui-extensibility';

import AssetEditor from './AssetEditor.tsx';
import AssetSelectionScreen from './AssetSelectionScreen.tsx';

manifest('Flowpack.Media.Ui:AssetEditor', {}, (globalRegistry, { frontendConfiguration }) => {
    const editorsRegistry = globalRegistry.get('inspector').get('editors');
    const secondaryEditorsRegistry = globalRegistry.get('inspector').get('secondaryEditors');
    const assetEditorConfig = frontendConfiguration['Flowpack.Media.Ui:AssetEditor'];

    editorsRegistry.set('Flowpack.Media.Ui/Inspector/Editors/AssetEditor', {
        component: class extends AssetEditor {
            getConfig() {
                return assetEditorConfig;
            }
        }
    });

    secondaryEditorsRegistry.set('Flowpack.Media.Ui/Secondary/Editors/AssetSelectionScreen', {
        component: AssetSelectionScreen
    });
});
