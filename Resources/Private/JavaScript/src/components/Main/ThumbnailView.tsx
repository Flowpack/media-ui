import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { Thumbnail } from './index';
import { loadingState } from '../../state';
import { useAssetQuery } from '../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        overflow: 'scroll',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: theme.spacing.full
    }
}));

export default function ThumbnailView() {
    const classes = useStyles();
    const { assets } = useAssetQuery();
    const isLoading = useRecoilValue(loadingState);
    const { translate } = useIntl();

    return (
        <section className={classes.thumbnailView}>
            {assets.length ? (
                assets.map((asset, index) => <Thumbnail key={index} asset={asset} />)
            ) : (
                <div>
                    {isLoading
                        ? translate('assetList.loading', 'Loading assets')
                        : translate('assetList.empty', 'No assets found')}
                </div>
            )}
        </section>
    );
}
