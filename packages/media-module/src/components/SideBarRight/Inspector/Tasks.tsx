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
import { applicationContextState, featureFlagsState, selectedAssetIdsState } from '@media-ui/core/src/state';
import { clipboardItemState, clipboardItemsState } from '@media-ui/feature-clipboard';

import DownloadAssetButton from '../../Actions/DownloadAssetButton';
import DeleteAssetButton from '../../Actions/DeleteAssetButton';

import classes from './Tasks.module.css';

const Tasks: React.FC = () => {
    const selectedAssets = useRecoilValue(selectedAssetIdsState);
    const { translate } = useIntl();
    const selectedAsset = useSelectedAsset();
    const applicationContext = useRecoilValue(applicationContextState);
    const { showSimilarAssets } = useRecoilValue(featureFlagsState);
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: selectedAsset?.id ?? '', assetSourceId: selectedAsset?.assetSource?.id ?? '' })
    );
    const [allInClipboard, toggleAllClipboardState] = useRecoilState(clipboardItemsState);

    const isMultiSelection = selectedAssets.length > 1;

    if (!selectedAsset && !isMultiSelection) return null;

    return (
        <div className={classes.tasks}>
            <Headline type="h2">
                <IconLabel icon="tasks" label={translate('inspector.actions', 'Tasks')} />
            </Headline>
            <div className={classes.buttonWrapper}>
                {!isMultiSelection && <AssetUsagesToggleButton />}
                {!isMultiSelection && showSimilarAssets && <SimilarAssetsToggleButton />}
                {/* TODO: Extend DownloadAssetButton to support multiple assets */}
                {!isMultiSelection && <DownloadAssetButton asset={selectedAsset} style="lighter" />}
                {!isMultiSelection && !selectedAsset.assetSource.readOnly && applicationContext !== 'details' && (
                    <>
                        <OpenAssetEditDialogButton />
                        <AssetReplacementButton />
                    </>
                )}
                {isMultiSelection ? (
                    <DeleteAssetButton assets={selectedAssets} style="lighter" />
                ) : (
                    <DeleteAssetButton asset={selectedAsset} style="lighter" />
                )}
                {isMultiSelection ? (
                    <IconButton
                        title={
                            allInClipboard
                                ? translate('itemActions.removeAllFromClipboard', 'Remove all from clipboard')
                                : translate('itemActions.copyAllToClipboard', 'Copy all to clipboard')
                        }
                        icon={allInClipboard ? 'clipboard-check' : 'clipboard'}
                        style="lighter"
                        hoverStyle="brand"
                        className={allInClipboard ? 'button--active' : ''}
                        onClick={toggleAllClipboardState}
                    />
                ) : (
                    selectedAsset.localId && (
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
                    )
                )}
            </div>
        </div>
    );
};

export default React.memo(Tasks);
