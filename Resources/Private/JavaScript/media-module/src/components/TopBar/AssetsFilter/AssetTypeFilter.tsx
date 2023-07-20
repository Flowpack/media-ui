import React, { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import {
    constraintsState,
    currentPageState,
    featureFlagsState,
    selectedAssetTypeState,
    selectedMediaTypeState,
} from '@media-ui/core/src/state';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage';
import classes from './AssetsFilter.module.css';

const UNUSED_FILTER_VALUE = 'unused';

interface AssetTypeOptions {
    [type: string]: {
        value: AssetType | 'unused';
        label: string;
        icon?: string;
    };
}

const AssetTypeFilter: React.FC = () => {
    const featureFlags = useRecoilValue(featureFlagsState);
    const { assetType: assetTypeConstraint } = useRecoilValue(constraintsState);
    const [assetTypeFilter, setAssetTypeFilter] = useRecoilState(selectedAssetTypeState);
    const setMediaTypeFilter = useSetRecoilState(selectedMediaTypeState);
    const [showUnusedAssets, setShowUnusedAssets] = useRecoilState(showUnusedAssetsState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const { translate } = useIntl();

    const currentValue = showUnusedAssets ? UNUSED_FILTER_VALUE : assetTypeFilter;

    const onValueChange = useCallback(
        (value) => {
            setShowUnusedAssets(value === 'unused');
            setMediaTypeFilter('');
            if (value !== UNUSED_FILTER_VALUE) {
                setAssetTypeFilter(value);
            }
            setCurrentPage(1);
        },
        [setShowUnusedAssets, setCurrentPage, setAssetTypeFilter, setMediaTypeFilter]
    );

    const assetTypeOptions = useMemo((): AssetTypeOptions => {
        const notAll = assetTypeConstraint && assetTypeConstraint !== 'all';
        const options = {
            video: {
                value: 'video' as AssetType,
                label: translate('typeFilter.assetType.values.video', 'Video'),
                disabled: notAll && assetTypeConstraint !== 'video',
            },
            audio: {
                value: 'audio' as AssetType,
                label: translate('typeFilter.assetType.values.audio', 'Audio'),
                disabled: notAll && assetTypeConstraint !== 'audio',
            },
            image: {
                value: 'image' as AssetType,
                label: translate('typeFilter.assetType.values.image', 'Image'),
                disabled: notAll && assetTypeConstraint !== 'image',
            },
            // TODO: The Media API currently only knows "Document" internally which is not a valid mimetype, we should "translate" this value on the internal API side and only use "application"
            document: {
                value: 'document' as AssetType,
                label: translate('typeFilter.assetType.values.document', 'Document'),
                disabled: notAll && assetTypeConstraint !== 'document',
            },
        };

        // TODO: Move the unused filter into the collection tree as "smart/pseudo collection"
        if (featureFlags.queryAssetUsage) {
            options[UNUSED_FILTER_VALUE] = {
                value: UNUSED_FILTER_VALUE,
                label: translate('typeFilter.assetType.values.unused', 'Unused'),
                disabled: notAll,
            };
        }

        return options;
    }, [translate, featureFlags, assetTypeConstraint]);

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={Object.values(assetTypeOptions)}
                onValueChange={onValueChange}
                value={currentValue}
                allowEmpty={!assetTypeConstraint || assetTypeConstraint === 'all'}
                placeholder={translate('typeFilter.assetType.values.all', 'All')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(AssetTypeFilter);
