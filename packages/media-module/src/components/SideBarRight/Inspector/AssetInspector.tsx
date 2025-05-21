import React from 'react';
import { useRecoilValue } from 'recoil';

import { Tabs } from '@neos-project/react-ui-components';

import { featureFlagsState, selectedAssetIdState, selectedInspectorViewState } from '@media-ui/core/src/state';
import VariantsInspector from '@media-ui/feature-asset-variants/src/components/VariantsInspector';

import PropertyInspector from './PropertyInspector';

import classes from './AssetInspector.module.css';

const AssetInspector = () => {
    const selectedAssetId = useRecoilValue(selectedAssetIdState);
    const { showVariantsEditor } = useRecoilValue(featureFlagsState);
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);

    if (!selectedAssetId || selectedInspectorView !== 'asset') return null;

    return showVariantsEditor ? (
        <Tabs theme={{ tabs__content: classes.tabContent }}>
            <Tabs.Panel icon="info-circle" key="editor" id="editor">
                <PropertyInspector />
            </Tabs.Panel>
            <Tabs.Panel icon="images">
                <VariantsInspector />
            </Tabs.Panel>
        </Tabs>
    ) : (
        <PropertyInspector />
    );
};

export default React.memo(AssetInspector);
