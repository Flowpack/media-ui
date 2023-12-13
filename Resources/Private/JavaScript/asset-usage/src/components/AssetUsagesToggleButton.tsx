import React from 'react';
import { useRecoilState } from 'recoil';

import { Badge, Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';
import useAssetUsagesQuery from '@media-ui/feature-asset-usage/src/hooks/useAssetUsages';

import classes from './AssetUsagesToggleButton.module.css';

const AssetUsagesToggleButton: React.FC = () => {
    const asset = useSelectedAsset();
    const { assetUsageDetails, loading } = useAssetUsagesQuery(
        asset ? { assetId: asset.id, assetSourceId: asset.assetSource.id } : null
    );
    const [assetUsagesModalOpen, setAssetUsagesModalOpen] = useRecoilState(assetUsageDetailsModalState);
    const { translate } = useIntl();

    return (
        <Button
            disabled={asset.isInUse === false}
            size="regular"
            style={assetUsagesModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setAssetUsagesModalOpen(true)}
        >
            <Icon icon="link" />
            {translate('assetUsageList.toggle', 'Show usages')}
            {assetUsageDetails?.[0]?.usages ? (
                <Badge label={assetUsageDetails[0].usages.length} className={classes.assetUsageBadge} />
            ) : (
                <></>
            )}
        </Button>
    );
};

export default React.memo(AssetUsagesToggleButton);
