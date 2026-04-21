import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { selectedAssetIdsState } from '@media-ui/core/src/state';

const useSelectAssets = () => {
    const [selectedAssets, setSelectedAssets] = useRecoilState(selectedAssetIdsState);

    const addToSelection = useCallback(
        (assetIdentity: AssetIdentity) => {
            setSelectedAssets((prev) => {
                if (prev.some((a) => a.assetId === assetIdentity.assetId)) {
                    return prev;
                }
                return [...prev, assetIdentity];
            });
        },
        [setSelectedAssets]
    );

    const removeFromSelection = useCallback(
        (assetIdentity: AssetIdentity) => {
            setSelectedAssets((prev) => prev.filter((a) => a.assetId !== assetIdentity.assetId));
        },
        [setSelectedAssets]
    );

    const toggleSelection = useCallback(
        (assetIdentity: AssetIdentity) => {
            setSelectedAssets((prev) => {
                if (prev.some((a) => a.assetId === assetIdentity.assetId)) {
                    return prev.filter((a) => a.assetId !== assetIdentity.assetId);
                }
                return [...prev, assetIdentity];
            });
        },
        [setSelectedAssets]
    );

    const addMultipleToSelection = useCallback(
        (assets: AssetIdentity[]) => {
            setSelectedAssets((prev) => {
                const existingIds = new Set(prev.map((a) => a.assetId));
                const newAssets = assets.filter((a) => !existingIds.has(a.assetId));
                return newAssets.length > 0 ? [...prev, ...newAssets] : prev;
            });
        },
        [setSelectedAssets]
    );

    const clearSelection = useCallback(() => {
        setSelectedAssets([]);
    }, [setSelectedAssets]);

    return {
        selectedAssets,
        addToSelection,
        addMultipleToSelection,
        removeFromSelection,
        toggleSelection,
        setSelection: setSelectedAssets,
        clearSelection,
    };
};

export default useSelectAssets;
