import React from 'react';
import cx from 'classnames';

import { useIntl, useMediaUi } from '@media-ui/core';

import PreviewActions from './PreviewActions';

import classes from './Preview.module.css';

interface PreviewProps {
    asset: null | Asset;
    loading: boolean;
    buildLinkToMediaUi: (asset: Asset) => string;
}

const Preview: React.FC<PreviewProps> = ({ asset, loading, buildLinkToMediaUi }: PreviewProps) => {
    const { translate } = useIntl();
    const { dummyImage } = useMediaUi();

    return (
        <figure className={cx(classes.preview, loading && classes.loading)} title={asset?.label}>
            {asset?.imported && <span className={classes.label}>{translate('asset.label.imported', 'Imported')}</span>}
            <picture className={classes.picture}>
                <img src={loading || !asset ? dummyImage : asset.previewUrl} alt={asset?.label} />
                <div className={classes.toolBar}>
                    {!loading && asset && <PreviewActions asset={asset} buildLinkToMediaUi={buildLinkToMediaUi} />}
                </div>
            </picture>
        </figure>
    );
};

export default React.memo(Preview, (prev, next) => prev.asset?.id === next.asset?.id);
