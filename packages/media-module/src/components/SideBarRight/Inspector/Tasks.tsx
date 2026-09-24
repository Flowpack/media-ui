import React from 'react';
import { useRecoilValue } from 'recoil';

import { DropDown, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import { AssetUsagesToggleButton } from '@media-ui/feature-asset-usage/src/index';
import { SimilarAssetsToggleButton } from '@media-ui/feature-similar-assets';
import { AssetReplacementButton } from '@media-ui/feature-asset-upload/src/components';
import { OpenAssetEditDialogButton } from '@media-ui/feature-asset-editing';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { applicationContextState, featureFlagsState, selectedAssetIdsState } from '@media-ui/core/src/state';
import { selectedAssetSourceIdState, useSelectedAssetSource } from '@media-ui/feature-asset-sources';

import {
    AssetClipboardListToggleButton,
    AssetClipboardToggleButton,
    DeleteAssetButton,
    DownloadAssetButton,
} from '../../Actions';

import classes from './Tasks.module.css';
import menuItemClasses from './TaskMenuItem.module.css';

const DropDownHeader = (DropDown as any).Header;
const DropDownContents = (DropDown as any).Contents;

const Tasks: React.FC = () => {
    const { translate } = useIntl();
    const assetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectedAssets = useRecoilValue(selectedAssetIdsState(assetSourceId));
    const applicationContext = useRecoilValue(applicationContextState);
    const { showSimilarAssets } = useRecoilValue(featureFlagsState);
    const selectedAssetSource = useSelectedAssetSource();
    const selectedAsset = useSelectedAsset();

    const isMultiSelection = selectedAssets.length > 1;
    const isReadonly = selectedAssetSource ? selectedAssetSource.readOnly : true;

    if (!selectedAsset && !isMultiSelection) return null;

    return (
        <DropDown className={classes.tasks}>
            <DropDownHeader className={classes.dropdownHeader} showDropDownToggle={false}>
                <IconLabel icon="tasks" label={translate('inspector.actions', 'Tasks')} />
                <Icon icon="ellipsis-v" />
            </DropDownHeader>
            <DropDownContents className={classes.dropdownContents}>
                {isMultiSelection ? (
                    <>
                        <li className={menuItemClasses.menuItem}>
                            <DownloadAssetButton assets={selectedAssets} />
                        </li>
                        {!isReadonly && (
                            <li className={menuItemClasses.menuItem}>
                                <DeleteAssetButton assets={selectedAssets} />
                            </li>
                        )}
                        <li className={menuItemClasses.menuItem}>
                            <AssetClipboardListToggleButton assetSourceId={assetSourceId} />
                        </li>
                    </>
                ) : selectedAsset ? (
                    <>
                        <li className={menuItemClasses.menuItem}>
                            <AssetUsagesToggleButton />
                        </li>
                        {showSimilarAssets && (
                            <li className={menuItemClasses.menuItem}>
                                <SimilarAssetsToggleButton />
                            </li>
                        )}
                        <li className={menuItemClasses.menuItem}>
                            <DownloadAssetButton assets={[selectedAsset]} />
                        </li>
                        {!isReadonly && applicationContext !== 'details' && (
                            <>
                                <li className={menuItemClasses.menuItem}>
                                    <OpenAssetEditDialogButton />
                                </li>
                                <li className={menuItemClasses.menuItem}>
                                    <AssetReplacementButton />
                                </li>
                                <li className={menuItemClasses.menuItem}>
                                    <DeleteAssetButton asset={selectedAsset} />
                                </li>
                            </>
                        )}
                        {selectedAsset.localId && (
                            <li className={menuItemClasses.menuItem}>
                                <AssetClipboardToggleButton asset={selectedAsset} />
                            </li>
                        )}
                    </>
                ) : null}
            </DropDownContents>
        </DropDown>
    );
};

export default React.memo(Tasks);
