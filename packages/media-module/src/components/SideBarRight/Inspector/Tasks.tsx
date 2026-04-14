import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Headline, IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import { AssetUsagesToggleButton } from '@media-ui/feature-asset-usage/src/index';
import { SimilarAssetsToggleButton } from '@media-ui/feature-similar-assets';
import { AssetReplacementButton } from '@media-ui/feature-asset-upload/src/components';
import { OpenAssetEditDialogButton } from '@media-ui/feature-asset-editing';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { applicationContextState, featureFlagsState } from '@media-ui/core/src/state';
import { clipboardItemState } from '@media-ui/feature-clipboard';

import DownloadAssetButton from '../../Actions/DownloadAssetButton';
import DeleteAssetButton from '../../Actions/DeleteAssetButton';

import classes from './Tasks.module.css';

interface TasksProps {
    isMultiAssetProcess?: boolean;
}

const Tasks: React.FC<TasksProps> = ({ isMultiAssetProcess = false }) => {
    const { translate } = useIntl();
    const selectedAsset = useSelectedAsset();
    const applicationContext = useRecoilValue(applicationContextState);
    const { showSimilarAssets } = useRecoilValue(featureFlagsState);
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: selectedAsset?.id ?? '', assetSourceId: selectedAsset?.assetSource?.id ?? '' })
    );

    if (!selectedAsset) return null;

    return (
        <div className={classes.tasks}>
            <Headline type="h2">
                <IconLabel icon="tasks" label={translate('inspector.actions', 'Tasks')} />
            </Headline>
            <div className={classes.buttonWrapper}>
                {!isMultiAssetProcess && <AssetUsagesToggleButton />}
                {!isMultiAssetProcess && showSimilarAssets && <SimilarAssetsToggleButton />}
                <DownloadAssetButton asset={selectedAsset} style="lighter" />
                {!isMultiAssetProcess && !selectedAsset.assetSource.readOnly && applicationContext !== 'details' && (
                    <>
                        <OpenAssetEditDialogButton />
                        <AssetReplacementButton />
                    </>
                )}
                <DeleteAssetButton asset={selectedAsset} style="lighter" />
                {selectedAsset.localId && (
                    <IconButton
                        title={
                            isInClipboard
                                ? translate('itemActions.removeFromClipboard', 'Remove from clipboard')
                                : translate('itemActions.copyToClipboard', 'Copy to clipboard')
                        }
                        icon={isInClipboard ? 'clipboard-check' : 'clipboard'}
                        style="lighter"
                        hoverStyle="brand"
                        className={isInClipboard ? 'button--active' : ''}
                        onClick={toggleClipboardState}
                    />
                )}
            </div>
        </div>
    );
};

export default React.memo(Tasks);
