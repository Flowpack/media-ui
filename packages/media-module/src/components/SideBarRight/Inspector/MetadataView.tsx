import React, { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Headline, Button } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { humanFileSize } from '@media-ui/core/src/helper';
import { IconLabel, PropertyList, PropertyListItem } from '@media-ui/core/src/components';
import { metadataEditorVisibleState } from '@media-ui/feature-metadata-editing';

const MetadataView: React.FC = () => {
    const { translate } = useIntl();
    const selectedAsset = useSelectedAsset();
    const [metadataEditorVisible, setMetadataEditorVisible] = useRecoilState(metadataEditorVisibleState);

    const toggleMetadataEditor = useCallback(() => {
        setMetadataEditorVisible((prev) => !prev);
    }, [setMetadataEditorVisible]);

    if (!selectedAsset) return null;

    return (
        <div>
            <Headline type="h2">
                <IconLabel icon="info-circle" label={translate('inspector.metadata', 'Metadata')} />
            </Headline>
            <Button type="button" onClick={toggleMetadataEditor} isActive={metadataEditorVisible}>
                Edit metadata
            </Button>
            <PropertyList>
                <PropertyListItem
                    label={translate('inspector.property.dimensions', 'Dimensions')}
                    value={`${selectedAsset.width}px x ${selectedAsset.height}px`}
                />
                {selectedAsset.file.size > 0 && (
                    <PropertyListItem
                        label={translate('inspector.property.fileSize', 'Size')}
                        value={humanFileSize(selectedAsset.file.size)}
                    />
                )}
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
        </div>
    );
};

export default React.memo(MetadataView);
