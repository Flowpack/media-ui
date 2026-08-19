import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useEvent } from '@media-ui/core/src/hooks';
import { assetRemovedEvent } from '@media-ui/core/src/events';
import { clipboardState } from '@media-ui/feature-clipboard';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

/**
 * Renderless component to keep the clipboard updated when certain events occur
 */
const ClipboardWatcher = () => {
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const setClipboardState = useSetRecoilState(clipboardState(selectedAssetSourceId));
    const assetRemoved = useEvent(assetRemovedEvent);

    useEffect(() => {
        const onAssetDelete = (_topic: any, assetIdentity: AssetIdentity) => {
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
