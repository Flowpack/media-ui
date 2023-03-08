import * as React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import similarAssetsModalState from '../state/similarAssetsModalState';

const SimilarAssetsToggleButton: React.FC = () => {
    const [similarAssetsModalOpen, setSimilarAssetsModalOpen] = useRecoilState(similarAssetsModalState);
    const { translate } = useIntl();

    return (
        <Button
            size="regular"
            style={similarAssetsModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setSimilarAssetsModalOpen(true)}
        >
            <Icon icon="equals" />
            {translate('similarAssetsModal.show', 'Show similar assets')}
        </Button>
    );
};

export default React.memo(SimilarAssetsToggleButton);
