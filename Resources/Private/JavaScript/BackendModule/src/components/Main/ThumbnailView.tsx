import * as React from 'react';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';

import { Thumbnail } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    thumbnailView: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: theme.spacing.full,
    },
}));

interface ThumbnailViewProps {
    assetIdentities: AssetIdentity[];
}

const ThumbnailView: React.FC<ThumbnailViewProps> = ({ assetIdentities }: ThumbnailViewProps) => {
    const classes = useStyles();

    return (
        <section className={classes.thumbnailView}>
            {assetIdentities.map((assetIdentity, index) => (
                <Thumbnail key={index} assetIdentity={assetIdentity} />
            ))}
        </section>
    );
};

export default React.memo(ThumbnailView);
