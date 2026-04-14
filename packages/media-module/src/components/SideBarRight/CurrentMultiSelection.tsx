import React from 'react';
import { useRecoilValue } from 'recoil';

import { Headline, Icon, IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useAssetQuery, useSelectAssets } from '@media-ui/core/src/hooks';
import { selectedAssetIdsState } from '@media-ui/core/src/state';

import classes from './CurrentMultiSelection.module.css';

interface MultiSelectionItemProps {
    assetIdentity: AssetIdentity;
    onRemove: (assetIdentity: AssetIdentity) => void;
}

const MultiSelectionItem: React.FC<MultiSelectionItemProps> = ({ assetIdentity, onRemove }) => {
    const { asset } = useAssetQuery(assetIdentity);

    return (
        <div className={classes.item} title={asset?.label}>
            <p>{asset?.label}</p>
            <button
                type="button"
                className={classes.removeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(assetIdentity);
                }}
            >
                <Icon icon="times" />
            </button>
        </div>
    );
};

const CurrentMultiSelection: React.FC = () => {
    const { translate } = useIntl();
    const selectedAssets = useRecoilValue(selectedAssetIdsState);
    const { removeFromSelection, clearSelection } = useSelectAssets();

    if (selectedAssets.length <= 1) return null;

    return (
        <div className={classes.currentMultiSelection}>
            <div className={classes.header}>
                <Headline type="h2" className={classes.headline}>
                    {translate('multiSelection.headline', 'Selected assets')} ({selectedAssets.length})
                </Headline>
                <IconButton
                    icon="times-circle"
                    size="small"
                    style="transparent"
                    hoverStyle="warn"
                    title={translate('multiSelection.clearAll', 'Clear selection')}
                    onClick={clearSelection}
                />
            </div>
            <div className={classes.scrollArea}>
                {selectedAssets.map((assetIdentity) => (
                    <MultiSelectionItem
                        key={assetIdentity.assetId}
                        assetIdentity={assetIdentity}
                        onRemove={removeFromSelection}
                    />
                ))}
            </div>
        </div>
    );
};

export default React.memo(CurrentMultiSelection);
