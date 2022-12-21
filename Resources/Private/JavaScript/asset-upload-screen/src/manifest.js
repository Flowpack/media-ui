import manifest from '@neos-project/neos-ui-extensibility';

import AssetUploadScreen from './AssetUploadScreen';

manifest('Flowpack.Media.Ui:AssetUploadScreen', {}, (globalRegistry, { frontendConfiguration }) => {
    const secondaryEditorsRegistry = globalRegistry.get('inspector').get('secondaryEditors');

    const { useNewAssetUpload } = frontendConfiguration['Flowpack.Media.Ui'];

    if (useNewAssetUpload) {
        secondaryEditorsRegistry.set('Neos.Neos/Inspector/Secondary/Editors/AssetUploadScreen', {
            component: AssetUploadScreen,
        });
    }
});
