import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useEvent } from '@media-ui/core/src/hooks';
import { assetRemovedEvent } from '@media-ui/core/src/events';
import { clipboardState } from '@media-ui/feature-clipboard';

/**
 * Renderless component to keep the clipboard updated when certain events occur
 */
const ClipboardWatcher = () => {
    const setClipboardState = useSetRecoilState(clipboardState);
    const assetRemoved = useEvent(assetRemovedEvent);

    useEffect(() => {
        const onAssetDelete = (topic, assetIdentity: AssetIdentity) => {
            void setClipboardState((prev) =>
                prev.filter(
                    ({ assetId, assetSourceId }) =>
                        !(assetId === assetIdentity.assetId && assetSourceId === assetIdentity.assetSourceId)
                )
            );
        };

        const token = assetRemoved.subscribe(onAssetDelete);

        return () => {
            assetRemoved.unsubscribe(token);
        };
    }, [setClipboardState, assetRemoved]);

    return null;
};

export default ClipboardWatcher;
