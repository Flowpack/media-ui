import React from 'react';
import { useRecoilValue } from 'recoil';

import { Tabs } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { featureFlagsState, selectedInspectorViewState } from '@media-ui/core/src/state';
import VariantsInspector from '@media-ui/feature-asset-variants/src/components/VariantsInspector';

import PropertyInspector from './PropertyInspector';

const useStyles = createUseMediaUiStyles({
    tabContent: {
        height: 'calc(100% - 42px)',
    },
});

const AssetInspector = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const { showVariantsEditor } = useRecoilValue(featureFlagsState);
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);

    if (!selectedAsset || selectedInspectorView !== 'asset') return null;

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
