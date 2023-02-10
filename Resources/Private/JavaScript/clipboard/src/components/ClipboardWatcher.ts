import { useEffect } from 'react';

import { useEvent } from '@media-ui/core/src/hooks';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { assetRemovedEvent } from '@media-ui/core/src/events';

import { useClipboard } from '../index';

/**
 * Renderless component to keep the clipboard updated when certain event occur
 */
const ClipboardWatcher = () => {
    const { toggleClipboardState } = useClipboard();
    const assetRemoved = useEvent(assetRemovedEvent);

    useEffect(() => {
        const onAssetDelete = (topic, assetIdentity: AssetIdentity) => {
            void toggleClipboardState(assetIdentity, false);
        };

        const token = assetRemoved.subscribe(onAssetDelete);

        return () => {
            assetRemoved.unsubscribe(token);
        };
    }, [toggleClipboardState, assetRemoved]);

    return null;
};

export default ClipboardWatcher;
