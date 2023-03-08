import * as React from 'react';

import { Headline } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi } from '@media-ui/core/src';
import { IconLabel } from '../../Presentation';
import { AssetUsagesToggleButton } from '@media-ui/feature-asset-usage/src/index';
import { SimilarAssetsToggleButton } from '@media-ui/feature-similar-assets';
import { AssetReplacementButton } from '@media-ui/feature-asset-upload/src/components';
import { OpenAssetEditDialogButton } from '@media-ui/feature-asset-editing';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import * as styles from './Tasks.module.css';

const Tasks: React.FC = () => {
    const { translate } = useIntl();
    const selectedAsset = useSelectedAsset();
    const { featureFlags, isInMediaDetailsScreen } = useMediaUi();

    return (
        <div className={styles.tasks}>
            <Headline type="h2">
                <IconLabel icon="tasks" label={translate('inspector.actions', 'Tasks')} />
            </Headline>
            <AssetUsagesToggleButton />
            {featureFlags.showSimilarAssets && <SimilarAssetsToggleButton />}
            {!selectedAsset.assetSource.readOnly && !isInMediaDetailsScreen && <AssetReplacementButton />}
            {!selectedAsset.assetSource.readOnly && !isInMediaDetailsScreen && <OpenAssetEditDialogButton />}
        </div>
    );
};

export default React.memo(Tasks);
