import * as React from 'react';

import { createUseMediaUiStyles, useIntl } from '../../core';
import { useAssetCountQuery } from '../../hooks';

const useStyles = createUseMediaUiStyles({
    assetCount: {
        height: '100%',
        alignSelf: 'flex-start',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none'
    }
});

const AssetCount: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { assetCount } = useAssetCountQuery();
    return (
        <div className={classes.assetCount}>
            {assetCount} {translate('pagination.assetCount', 'assets')}
        </div>
    );
};

export default React.memo(AssetCount);
