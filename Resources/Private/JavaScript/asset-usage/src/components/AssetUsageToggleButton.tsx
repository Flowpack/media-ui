import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import assetUsageModalState from '../state/assetUsageModalState';

const AssetUsageToggleButton: React.FC = () => {
    const [assetUsageModalOpen, setAssetUsageModalOpen] = useRecoilState(assetUsageModalState);
    const { translate } = useIntl();
    // TODO: Resolve actual usage when calculation is fast enough or data has been preloaded
    const usage = 1;

    return (
        <Button
            disabled={!usage}
            size="regular"
            style={assetUsageModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setAssetUsageModalOpen(!assetUsageModalOpen)}
        >
            {translate('assetUsageList.toggle', 'Toggle usages')}
        </Button>
    );
};

export default React.memo(AssetUsageToggleButton);
