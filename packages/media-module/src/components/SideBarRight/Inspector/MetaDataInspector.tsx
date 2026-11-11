import React, { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Button, ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useConfigQuery, useSelectedAsset } from '@media-ui/core/src/hooks';
import { IconLabel, PropertyList, PropertyListItem } from '@media-ui/core/src/components';

import { metadataEditorVisibleState } from '@media-ui/feature-metadata-editing';

import classes from './MetaDataInspector.module.css';
import { multiSelectionState } from '@media-ui/core/src/state';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

const MetaDataInspector: React.FC = () => {
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectedAsset = useSelectedAsset();
    const isMultiSelection = useRecoilValue(multiSelectionState(selectedAssetSourceId));
    const { translate } = useIntl();
    const { config } = useConfigQuery();
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [metadataEditorVisible, setMetadataEditorVisible] = useRecoilState(metadataEditorVisibleState);

    const toggleMetadataEditor = useCallback(() => {
        setMetadataEditorVisible((prev) => !prev);
    }, [setMetadataEditorVisible]);

    if (!config.supportsMetadataEditing && !selectedAsset?.metadata?.length) return null;

    return (
        <div className={classes.metaData}>
            <ToggablePanel
                closesToBottom={true}
                className={classes.metaDataPanel}
                isOpen={!collapsed}
                onPanelToggle={() => setCollapsed((prev) => !prev)}
            >
                <ToggablePanel.Header className={classes.metaDataPanelHeader}>
                    <IconLabel icon="list-alt" label={translate('inspector.metadata', 'Metadata')} />
                </ToggablePanel.Header>
                <ToggablePanel.Contents className={classes.metaDataPanelContents}>
                    {config.supportsMetadataEditing && (
                        <Button type="button" onClick={toggleMetadataEditor} isActive={metadataEditorVisible}>
                            {translate('inspector.toggleMetadataEditor', 'Edit metadata')}
                        </Button>
                    )}
                    {!isMultiSelection && selectedAsset?.metadata?.length ? (
                        <PropertyList>
                            {selectedAsset.metadata.flatMap((metaDataProperty) => {
                                const items: React.ReactElement<typeof PropertyListItem>[] = [
                                    <PropertyListItem
                                        key={metaDataProperty.propertyName}
                                        label={metaDataProperty.propertyLabel}
                                        value={metaDataProperty.value}
                                    />,
                                ];
                                if (metaDataProperty.inheritedValue) {
                                    items.push(
                                        <PropertyListItem
                                            key={`${metaDataProperty.propertyName}-inherited`}
                                            label={translate(
                                                'inspector.metaData.inherited',
                                                '{propertyName} (inherited)',
                                                [metaDataProperty.propertyLabel]
                                            )}
                                            value={metaDataProperty.inheritedValue}
                                        />
                                    );
                                }
                                return items;
                            })}
                        </PropertyList>
                    ) : null}
                </ToggablePanel.Contents>
            </ToggablePanel>
        </div>
    );
};

export default React.memo(MetaDataInspector);
