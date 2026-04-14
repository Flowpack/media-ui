import React, { useCallback, useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import cx from 'classnames';

import { useSelectAsset, useSelectAssets } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';

import { Thumbnail } from './index';

import classes from './ThumbnailView.module.css';
import { useMediaUi } from '@media-ui/core';

interface ThumbnailViewProps {
    assetIdentities: AssetIdentity[];
}

const ThumbnailView: React.FC<ThumbnailViewProps> = ({ assetIdentities }: ThumbnailViewProps) => {
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const selectAsset = useSelectAsset();
    const { selectionMode } = useMediaUi();
    const { selectedAssets, addToSelection, addMultipleToSelection, toggleSelection, clearSelection } =
        useSelectAssets();
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
                clearSelection();
                addToSelection(assetIdentity);
                lastClickedIndexRef.current = assetIdentities.findIndex((a) => a.assetId === assetIdentity.assetId);
            }
        },
        [setSelectedAssetForPreview, selectAsset, clearSelection, addToSelection, assetIdentities]
    );

    const onMultiSelect = useCallback(
        (assetIdentity: AssetIdentity, event: React.MouseEvent) => {
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

    return (
        <section className={cx(classes.thumbnailView, selectionMode && classes.thumbnailViewInSelectionMode)}>
            {assetIdentities.map((assetIdentity, index) => (
                <Thumbnail
                    key={index}
                    assetIdentity={assetIdentity}
                    onSelect={onSelect}
                    onMultiSelect={onMultiSelect}
                />
            ))}
        </section>
    );
};

export default React.memo(ThumbnailView);
