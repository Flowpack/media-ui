import * as React from 'react';
import { useMemo } from 'react';
import { fromString as getMediaTypeFromString } from 'media-type';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { useSelectedAsset } from '../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    currentSelection: {},
    headline: {
        fontWeight: 'bold',
        lineHeight: theme.spacing.goldenUnit
    }
}));

const CurrentSelection: React.FC = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const { translate } = useIntl();

    const assetIcon = useMemo(() => {
        if (selectedAsset?.file.mediaType) {
            const mainMediaType = getMediaTypeFromString(selectedAsset.file.mediaType);
            if (mainMediaType.type === 'audio') return 'file-audio';
            if (mainMediaType.type === 'video') return 'file-video';
            if (mainMediaType.type === 'image') return 'file-image';
        }
        return 'file';
    }, [selectedAsset?.file.mediaType]);

    if (!selectedAsset) return null;

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {translate('currentSelection.headline', 'Selected asset')}
            </Headline>
            <SelectBox
                options={[{ value: selectedAsset.filename, label: selectedAsset.label, icon: assetIcon }]}
                onValueChange={() => null}
                value={selectedAsset.filename}
            />
        </div>
    );
};

export default React.memo(CurrentSelection);
