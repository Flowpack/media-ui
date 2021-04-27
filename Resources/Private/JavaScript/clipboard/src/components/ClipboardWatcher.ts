import { useEffect } from 'react';

import { useEvent } from '@media-ui/core/src/hooks';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { assetDeletedEvent } from '@media-ui/core/src/events';

import { useClipboard } from '../index';

/**
 * Renderless component to keep the clipboard updated when certain event occur
 */
const ClipboardWatcher = () => {
    const { toggleClipboardState } = useClipboard();
    const assetDeleted = useEvent(assetDeletedEvent);

    useEffect(() => {
        const onAssetDelete = (topic, assetIdentity: AssetIdentity) => {
            console.log(assetIdentity, 'Asset has been deleted. Updating clipboard');
            toggleClipboardState(assetIdentity, false);
        };

        const token = assetDeleted.subscribe(onAssetDelete);

        return () => {
            assetDeleted.unsubscribe(token);
        };
    }, [toggleClipboardState, assetDeleted]);

    return null;
};

export default ClipboardWatcher;
