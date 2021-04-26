import * as React from 'react';

import { useIntl, createUseMediaUiStyles } from '@media-ui/core/src';

import { useAssetCount } from '../../../hooks';

const useStyles = createUseMediaUiStyles({
    assetCount: {
        height: '100%',
        alignSelf: 'flex-start',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
    },
});

const AssetCount: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const assetCount = useAssetCount();

    return (
        <div className={classes.assetCount}>
            {assetCount} {translate('pagination.assetCount', 'assets')}
        </div>
    );
};

export default React.memo(AssetCount);
