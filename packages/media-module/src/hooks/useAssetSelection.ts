import { useCallback, useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSelectAsset } from '@media-ui/core/src/hooks';
import { useSelectAssets } from '@media-ui/media-module/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';

const useAssetSelection = (assetIdentities: AssetIdentity[]) => {
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const selectAsset = useSelectAsset();
    const { selectedAssets, addMultipleToSelection, toggleSelection, setSelection } = useSelectAssets();
    const lastClickedIndexRef = useRef<number>(-1);

    useEffect(() => {
        if (selectedAssets.length === 0) {
            lastClickedIndexRef.current = -1;
        } else if (selectedAssets.length === 1 && lastClickedIndexRef.current === -1) {
            lastClickedIndexRef.current = assetIdentities.findIndex((a) => a.assetId === selectedAssets[0].assetId);
        }
    }, [selectedAssets, assetIdentities]);

    const onSelect = useCallback(
        (assetIdentity: AssetIdentity, openPreview = false) => {
            if (openPreview) {
                setSelectedAssetForPreview(assetIdentity);
            } else {
                selectAsset(assetIdentity);
                setSelection([assetIdentity]);
                lastClickedIndexRef.current = assetIdentities.findIndex((a) => a.assetId === assetIdentity.assetId);
            }
        },
        [setSelectedAssetForPreview, selectAsset, setSelection, assetIdentities]
    );

    const onMultiSelect = useCallback(
        (assetIdentity: AssetIdentity, event: { shiftKey: boolean }) => {
            const currentIndex = assetIdentities.findIndex((a) => a.assetId === assetIdentity.assetId);

            if (event.shiftKey && lastClickedIndexRef.current >= 0) {
                const start = Math.min(lastClickedIndexRef.current, currentIndex);
                const end = Math.max(lastClickedIndexRef.current, currentIndex);
                addMultipleToSelection(assetIdentities.slice(start, end + 1));
            } else {
                toggleSelection(assetIdentity);
            }

            lastClickedIndexRef.current = currentIndex;
        },
        [assetIdentities, addMultipleToSelection, toggleSelection]
    );

    return { onSelect, onMultiSelect };
};

export default useAssetSelection;
