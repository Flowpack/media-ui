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
        // Reset last clicked index when the selection is empty
        if (selectedAssets.length === 0) {
            lastClickedIndexRef.current = -1;
            return;
        }
        // Set last clicked index when a single asset is selected and no previous index is set
        if (selectedAssets.length === 1 && lastClickedIndexRef.current === -1) {
            lastClickedIndexRef.current = assetIdentities.findIndex((a) => a.assetId === selectedAssets[0].assetId);
            return;
        }
        // Update last clicked index when the selection changes externally (e.g. by deselecting an asset in the sidebar or clearing the selection)
        if (lastClickedIndexRef.current >= 0) {
            const lastSelectedAssetId = assetIdentities[lastClickedIndexRef.current]?.assetId;
            if (lastSelectedAssetId && !selectedAssets.some((a) => a.assetId === lastSelectedAssetId)) {
                const nextHighestSelectionIndex = selectedAssets.at(-1)?.assetId;
                lastClickedIndexRef.current =
                    assetIdentities.findIndex((a) => a.assetId === nextHighestSelectionIndex) ?? -1;
                return;
            }
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
