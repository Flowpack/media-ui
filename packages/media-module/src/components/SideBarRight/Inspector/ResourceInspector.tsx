import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { humanFileSize } from '@media-ui/core/src/helper';
import { IconLabel, PropertyList, PropertyListItem } from '@media-ui/core/src/components';
import { multiSelectionState } from '@media-ui/core/src/state';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

import classes from './ResourceInspector.module.css';

const ResourceInspector: React.FC = () => {
    const { translate } = useIntl();
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectedAsset = useSelectedAsset();
    const isMultiSelection = useRecoilValue(multiSelectionState(selectedAssetSourceId));
    const [collapsed, setCollapsed] = useState<boolean>(true);

    if (!selectedAsset || isMultiSelection) return null;

    return (
        <div className={classes.resourceInspector}>
            <ToggablePanel
                closesToBottom={true}
                className={classes.resourcePanel}
                isOpen={!collapsed}
                onPanelToggle={() => setCollapsed((prev) => !prev)}
            >
                <ToggablePanel.Header className={classes.resourcePanelHeader}>
                    <IconLabel icon="info-circle" label={translate('inspector.properties', 'Properties')} />
                </ToggablePanel.Header>
                <ToggablePanel.Contents className={classes.resourcePanelContents}>
                    <PropertyList>
                        <PropertyListItem
                            label={translate('inspector.property.dimensions', 'Dimensions')}
                            value={`${selectedAsset.width}px x ${selectedAsset.height}px`}
                        />
                        {selectedAsset.file.size && selectedAsset.file.size > 0 ? (
                            <PropertyListItem
                                label={translate('inspector.property.fileSize', 'Size')}
                                value={humanFileSize(selectedAsset.file.size)}
                            />
                        ) : null}
                        <PropertyListItem
                            label={translate('inspector.property.filename', 'Filename')}
                            value={selectedAsset.filename}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.lastModified', 'Last modified')}
                            value={new Date(selectedAsset.lastModified).toLocaleString()}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.mediaType', 'MIME type')}
                            value={selectedAsset.file.mediaType}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.identifier', 'Identifier')}
                            value={selectedAsset.id}
                        />
                    </PropertyList>
                </ToggablePanel.Contents>
            </ToggablePanel>
        </div>
    );
};

export default React.memo(ResourceInspector);
