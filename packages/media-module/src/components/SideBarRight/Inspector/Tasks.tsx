import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { DropDown, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import { AssetUsagesToggleButton } from '@media-ui/feature-asset-usage/src/index';
import { SimilarAssetsToggleButton } from '@media-ui/feature-similar-assets';
import { AssetReplacementButton } from '@media-ui/feature-asset-upload/src/components';
import { OpenAssetEditDialogButton } from '@media-ui/feature-asset-editing';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { applicationContextState, featureFlagsState, selectedAssetIdsState } from '@media-ui/core/src/state';
import { clipboardItemState, clipboardItemsState } from '@media-ui/feature-clipboard';
import { selectedAssetSourceIdState, useSelectedAssetSource } from '@media-ui/feature-asset-sources';

import DownloadAssetButton from '../../Actions/DownloadAssetButton';
import DeleteAssetButton from '../../Actions/DeleteAssetButton';

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
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: selectedAsset?.id ?? '', assetSourceId: selectedAsset?.assetSource?.id ?? '' })
    );
    const [allInClipboard, toggleAllClipboardState] = useRecoilState(clipboardItemsState(assetSourceId));

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
                    <DownloadAssetButton
                        assets={selectedAssets}
                        variant="menuItem"
                        menuItemClassName={menuItemClasses.menuItem}
                        menuItemDisabledClassName={menuItemClasses['menuItem--disabled']}
                    />
                    {!isReadonly && (
                        <DeleteAssetButton
                            assets={selectedAssets}
                            variant="menuItem"
                            menuItemClassName={menuItemClasses.menuItem}
                            menuItemDisabledClassName={menuItemClasses['menuItem--disabled']}
                        />
                    )}
                    <li className={menuItemClasses.menuItem} onClick={() => toggleAllClipboardState(!allInClipboard)}>
                        <Icon icon={allInClipboard ? 'clipboard-check' : 'clipboard'} />
                        <span>
                            {allInClipboard
                                ? translate('itemActions.removeAllFromClipboard', 'Remove all from clipboard')
                                : translate('itemActions.copyAllToClipboard', 'Copy all to clipboard')}
                        </span>
                    </li>
                    </>
                ) : (
                    <>
                        <AssetUsagesToggleButton
                            variant="menuItem"
                            menuItemClassName={menuItemClasses.menuItem}
                            menuItemDisabledClassName={menuItemClasses['menuItem--disabled']}
                        />
                        {showSimilarAssets && (
                            <SimilarAssetsToggleButton variant="menuItem" menuItemClassName={menuItemClasses.menuItem} />
                        )}
                        <DownloadAssetButton
                            assets={[selectedAsset]}
                            variant="menuItem"
                            menuItemClassName={menuItemClasses.menuItem}
                            menuItemDisabledClassName={menuItemClasses['menuItem--disabled']}
                        />
                        {!isReadonly && applicationContext !== 'details' && (
                            <>
                                <OpenAssetEditDialogButton
                                    variant="menuItem"
                                    menuItemClassName={menuItemClasses.menuItem}
                                />
                                <AssetReplacementButton
                                    variant="menuItem"
                                    menuItemClassName={menuItemClasses.menuItem}
                                />
                                <DeleteAssetButton
                                    asset={selectedAsset}
                                    variant="menuItem"
                                    menuItemClassName={menuItemClasses.menuItem}
                                    menuItemDisabledClassName={menuItemClasses['menuItem--disabled']}
                                />
                            </>
                        )}
                        {selectedAsset.localId && (
                            <li className={menuItemClasses.menuItem} onClick={() => toggleClipboardState(!isInClipboard)}>
                                <Icon icon={isInClipboard ? 'clipboard-check' : 'clipboard'} />
                                <span>
                                    {isInClipboard
                                        ? translate('itemActions.removeFromClipboard', 'Remove from clipboard')
                                        : translate('itemActions.copyToClipboard', 'Copy to clipboard')}
                                </span>
                            </li>
                        )}
                    </>
                )}
            </DropDownContents>
        </DropDown>
    );
};

export default React.memo(Tasks);
