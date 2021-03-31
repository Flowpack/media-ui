import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';

const AssetUsagesToggleButton: React.FC = () => {
    const [assetUsagesModalOpen, setAssetUsagesModalOpen] = useRecoilState(assetUsageDetailsModalState);
    const { translate } = useIntl();
    // TODO: Resolve actual usage when calculation is fast enough or data has been preloaded
    const usage = 1;

    return (
        <Button
            disabled={!usage}
            size="regular"
            style={assetUsagesModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setAssetUsagesModalOpen(true)}
        >
            {translate('assetUsageList.toggle', 'Show usages')}
        </Button>
    );
};

export default React.memo(AssetUsagesToggleButton);
