import * as React from 'react';
import { useMemo } from 'react';
import mediaType from 'media-type';
import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../core';
import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    currentSelection: {
        '.neos &': {
            marginBottom: theme.spacing.full
        }
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit
        }
    }
}));

export default function CurrentSelection() {
    const classes = useStyles();
    const { selectedAsset } = useMediaUi();
    const { translate } = useIntl();

    const assetIcon = useMemo(() => {
        if (selectedAsset?.mediaType) {
            const mainMediaType = mediaType.fromString(selectedAsset.mediaType);
            if (mainMediaType.type === 'audio') return 'file-audio';
            if (mainMediaType.type === 'video') return 'file-video';
            if (mainMediaType.type === 'image') return 'file-image';
        }
        return 'file';
    }, [selectedAsset?.mediaType]);

    return (
        <>
            {selectedAsset && (
                <div className={classes.currentSelection}>
                    <Headline type="h2" className={classes.headline}>
                        {translate('currentSelection.headline', 'Selected asset')}
                    </Headline>
                    <SelectBox
                        options={[{ value: selectedAsset.filename, label: selectedAsset.label, icon: assetIcon }]}
                        value={selectedAsset.filename}
                    />
                </div>
            )}
        </>
    );
}
