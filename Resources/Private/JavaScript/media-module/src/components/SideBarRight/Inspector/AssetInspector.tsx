import * as React from 'react';

import { Tabs } from '@neos-project/react-ui-components';
import { createUseMediaUiStyles, useMediaUi } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { selectedInspectorViewState } from '@media-ui/core/src/state';
import VariantsInspector from '@media-ui/feature-asset-variants/src/components/VariantsInspector';
import PropertyInspector from './PropertyInspector';

import { useRecoilValue } from 'recoil';

const useStyles = createUseMediaUiStyles({
    tabContent: {
        height: 'calc(100% - 42px)',
    },
});

const AssetInspector = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const { featureFlags } = useMediaUi();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);

    if (!selectedAsset || selectedInspectorView !== 'asset') return null;

    return featureFlags.showVariantsEditor ? (
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
