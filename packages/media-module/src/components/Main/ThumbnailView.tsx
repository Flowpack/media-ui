import React from 'react';
import cx from 'classnames';

import { useMediaUi } from '@media-ui/core';

import { Thumbnail } from './index';
import { useAssetSelection } from '../../hooks';

import classes from './ThumbnailView.module.css';

interface ThumbnailViewProps {
    assetIdentities: AssetIdentity[];
}

const ThumbnailView: React.FC<ThumbnailViewProps> = ({ assetIdentities }: ThumbnailViewProps) => {
    const { selectionMode } = useMediaUi();
    const { onSelect, onMultiSelect } = useAssetSelection(assetIdentities);

    return (
        <section className={cx(classes.thumbnailView, selectionMode && classes.thumbnailViewInSelectionMode)}>
            {assetIdentities.map((assetIdentity) => (
                <Thumbnail
                    key={assetIdentity.assetId}
                    assetIdentity={assetIdentity}
                    onSelect={onSelect}
                    onMultiSelect={onMultiSelect}
                />
            ))}
        </section>
    );
};

export default React.memo(ThumbnailView);
