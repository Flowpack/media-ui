import * as React from 'react';
import { useMemo } from 'react';

import { useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { Thumbnail } from './index';
import { useAssetQuery } from '../../hooks';
import LoadingLabel from '../LoadingLabel';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: theme.spacing.full
    }
}));

const ThumbnailView: React.FC = () => {
    const classes = useStyles();
    const { assets } = useAssetQuery();
    const { translate } = useIntl();

    const thumbnails = useMemo(() => assets.map((asset, index) => <Thumbnail key={index} asset={asset} />), [assets]);

    return (
        <section className={classes.thumbnailView}>
            {assets.length ? (
                thumbnails
            ) : (
                <LoadingLabel
                    loadingText={translate('assetList.loading', 'Loading assets')}
                    emptyText={translate('assetList.empty', 'No assets found')}
                />
            )}
        </section>
    );
};

export default React.memo(ThumbnailView);
