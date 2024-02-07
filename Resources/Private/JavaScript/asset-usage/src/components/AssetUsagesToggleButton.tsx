import React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';

const AssetUsagesToggleButton: React.FC = () => {
    const { isInUse } = useSelectedAsset();
    const [assetUsagesModalOpen, setAssetUsagesModalOpen] = useRecoilState(assetUsageDetailsModalState);
    const { translate } = useIntl();

    return (
        <Button
            disabled={isInUse === false}
            size="regular"
            style={assetUsagesModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setAssetUsagesModalOpen(true)}
            title={translate('assetUsageList.toggle', 'Show usages')}
        >
            <Icon icon="link" />
        </Button>
    );
};

export default React.memo(AssetUsagesToggleButton);
