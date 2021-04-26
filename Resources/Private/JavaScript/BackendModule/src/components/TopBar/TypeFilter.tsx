import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useMediaUi } from '@media-ui/core/src';
import { currentPageState, selectedMediaTypeState } from '@media-ui/core/src/state';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage/src';

import { MainViewState, mainViewState } from '../../state';

const useStyles = createUseMediaUiStyles({
    typeFilter: {},
    selectBox: {
        minWidth: 'auto',
    },
});

interface MediaTypeOptions {
    [type: string]: {
        value: string;
        label: string;
        icon: string;
    };
}

const UNUSED_FILTER_VALUE = 'unused';

const TypeFilter: React.FC = () => {
    const classes = useStyles();
    const { featureFlags } = useMediaUi();
    const [mediaTypeFilter, setMediaTypeFilter] = useRecoilState(selectedMediaTypeState);
    const [showUnusedAssets, setShowUnusedAssets] = useRecoilState(showUnusedAssetsState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const currentValue = showUnusedAssets ? UNUSED_FILTER_VALUE : mediaTypeFilter;

    const onValueChange = useCallback(
        (value) => {
            setShowUnusedAssets(value === 'unused');
            if (value !== UNUSED_FILTER_VALUE) {
                setMediaTypeFilter(value);
            }
            setCurrentPage(1);
        },
        [setCurrentPage, setShowUnusedAssets, setMediaTypeFilter]
    );

    const mediaTypeOptions = useMemo((): MediaTypeOptions => {
        const options = {
            video: {
                value: 'video',
                label: translate('typeFilter.mediaType.values.video', 'Video'),
                icon: 'file-video',
            },
            audio: {
                value: 'audio',
                label: translate('typeFilter.mediaType.values.audio', 'Audio'),
                icon: 'file-audio',
            },
            image: {
                value: 'image',
                label: translate('typeFilter.mediaType.values.image', 'Images'),
                icon: 'file-image',
            },
            // TODO: The Media API currently only knows "Document" internally which is not a valid mimetype
            document: {
                value: 'document',
                label: translate('typeFilter.mediaType.values.document', 'Document'),
                icon: 'file',
            },
        };

        if (featureFlags.queryAssetUsage) {
            options[UNUSED_FILTER_VALUE] = {
                value: UNUSED_FILTER_VALUE,
                label: translate('typeFilter.mediaType.values.unused', 'Unused'),
                icon: 'fab fa-creative-commons-zero',
            };
        }

        return options;
    }, [translate, featureFlags]);

    if (![MainViewState.DEFAULT, MainViewState.UNUSED_ASSETS].includes(mainView)) return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={Object.values(mediaTypeOptions)}
                onValueChange={onValueChange}
                value={currentValue}
                allowEmpty={true}
                placeholderIcon="photo-video"
                placeholder={translate('typeFilter.mediaType.values.all', 'All')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(TypeFilter);
