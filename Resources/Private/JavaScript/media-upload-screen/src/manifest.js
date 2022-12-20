import manifest from '@neos-project/neos-ui-extensibility';

import MediaUploadScreen from './MediaUploadScreen';

manifest('Flowpack.Media.Ui:MediaUploadScreen', {}, (globalRegistry, { frontendConfiguration }) => {
    const secondaryEditorsRegistry = globalRegistry.get('inspector').get('secondaryEditors');

    const { useNewMediaUpload } = frontendConfiguration['Flowpack.Media.Ui'];

    if (useNewMediaUpload) {
        secondaryEditorsRegistry.set('Neos.Neos/Inspector/Secondary/Editors/MediaUploadScreen', {
            component: MediaUploadScreen,
        });
    }
});
