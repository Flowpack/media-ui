import manifest from '@neos-project/neos-ui-extensibility';

import MediaDetailsScreen from './MediaDetailsScreen';
import MediaSelectionScreen from './MediaSelectionScreen';

manifest('Flowpack.Media.Ui:MediaSelectionScreen', {}, (globalRegistry, { frontendConfiguration }) => {
    const secondaryEditorsRegistry = globalRegistry.get('inspector').get('secondaryEditors');

    const { useNewMediaSelection } = frontendConfiguration['Flowpack.Media.Ui'];

    if (useNewMediaSelection) {
        secondaryEditorsRegistry.set('Neos.Neos/Inspector/Secondary/Editors/MediaDetailsScreen', {
            component: MediaDetailsScreen,
        });
        secondaryEditorsRegistry.set('Neos.Neos/Inspector/Secondary/Editors/MediaSelectionScreen', {
            component: MediaSelectionScreen,
        });
    }
});
