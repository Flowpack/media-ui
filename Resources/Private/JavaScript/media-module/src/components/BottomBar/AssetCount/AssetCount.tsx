import React from 'react';

import { useIntl } from '@media-ui/core/src';

import { useAssetCount } from '../../../hooks';

import classes from './AssetCount.module.css';

const AssetCount: React.FC = () => {
    const { translate } = useIntl();
    const assetCount = useAssetCount();

    return (
        <div className={classes.assetCount}>
            {assetCount} {translate('pagination.assetCount', 'assets')}
        </div>
    );
};

export default React.memo(AssetCount);
