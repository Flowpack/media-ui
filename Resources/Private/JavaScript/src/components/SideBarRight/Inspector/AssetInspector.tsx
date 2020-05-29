import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';

import { Button, Label, TextArea, TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useMediaUi, useNotify } from '../../../core';
import { AssetProxy, MediaUiTheme } from '../../../interfaces';
import { PropertyList, PropertyListItem } from '.';
import { humanFileSize } from '../../../helper/FileSize';
import { UPDATE_ASSET } from '../../../queries/Mutations';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    inspector: {
        display: 'grid',
        gridAutoRows: 'auto',
        gridGap: '1rem',
        '& ul': {
            backgroundColor: theme.alternatingBackgroundColor,
            padding: '1rem'
        },
        '& input, & textarea': {
            width: '100%'
        }
    },
    propertyGroup: {},
    actions: {
        display: 'flex',
        position: 'sticky',
        backgroundColor: theme.colors.contrastNeutral,
        bottom: 0,
        '& > *': {
            flex: 1
        }
    }
}));

interface AssetUpdate {
    id: string;
    assetSource: string;
    title?: string;
    caption?: string;
}

export default function AssetInspector() {
    const classes = useStyles();
    const { selectedAsset, setSelectedAsset } = useMediaUi();
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState(selectedAsset?.label);
    const [caption, setCaption] = useState(selectedAsset?.caption);
    const [updateAsset, { error, data }] = useMutation<{ updateAsset: AssetProxy }, AssetUpdate>(UPDATE_ASSET, {
        variables: {
            id: selectedAsset?.id,
            assetSource: selectedAsset?.assetSource?.id,
            title: label,
            caption
        }
    });
    const isImported = !!selectedAsset?.imported;
    const hasUnpublishedChanges = selectedAsset && (label !== selectedAsset.label || caption !== selectedAsset.caption);

    useEffect(() => {
        setLabel(selectedAsset?.label);
        setCaption(selectedAsset?.caption);
    }, [selectedAsset]);

    const handleDiscard = () => {
        setLabel(selectedAsset?.label);
        setCaption(selectedAsset?.caption);
    };
    const handleApply = () => {
        updateAsset()
            .then(({ data }) => {
                setSelectedAsset(data.updateAsset);
                Notify.ok(translate('inspector.message.assetUpdated', 'Asset has been updated'));
            })
            .catch(error => {
                Notify.error(error);
            });
    };

    return (
        <>
            {selectedAsset && (
                <div className={classes.inspector}>
                    {selectedAsset.localAssetData && (
                        <>
                            <div className={classes.propertyGroup}>
                                <Label>{translate('inspector.title', 'Title')}</Label>
                                <TextInput
                                    disabled={!isImported}
                                    type="text"
                                    value={label}
                                    onChange={value => setLabel(value)}
                                />
                            </div>
                            <div className={classes.propertyGroup}>
                                <Label>{translate('inspector.caption', 'Caption')}</Label>
                                <TextArea
                                    disabled={!isImported}
                                    minRows={3}
                                    expandedRows={6}
                                    value={caption}
                                    onChange={value => setCaption(value)}
                                />
                            </div>
                            {selectedAsset.localAssetData.tags.length ? (
                                <div className={classes.propertyGroup}>
                                    <Label>{translate('inspector.tags', 'Tags')}</Label>
                                    <ul>
                                        {selectedAsset.localAssetData.tags.map(tag => (
                                            <li key={tag.label}>{tag.label}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {selectedAsset.localAssetData.assetCollections.length ? (
                                <div className={classes.propertyGroup}>
                                    <Label>{translate('inspector.assetCollections', 'Collections')}</Label>
                                    <ul>
                                        {selectedAsset.localAssetData.assetCollections.map(assetCollection => (
                                            <li key={assetCollection.title}>{assetCollection.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </>
                    )}
                    <PropertyList>
                        {selectedAsset.fileSize > 0 && (
                            <PropertyListItem
                                label={translate('inspector.property.fileSize', 'Size')}
                                value={humanFileSize(selectedAsset.fileSize)}
                            />
                        )}
                        <PropertyListItem
                            label={translate('inspector.property.lastModified', 'Last modified')}
                            value={new Date(selectedAsset.lastModified).toLocaleString()}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.dimensions', 'Dimensions')}
                            value={`${selectedAsset.widthInPixels}px x ${selectedAsset.heightInPixels}px`}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.mediaType', 'MIME type')}
                            value={selectedAsset.mediaType}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.filename', 'Filename')}
                            value={selectedAsset.filename}
                        />
                    </PropertyList>
                    {selectedAsset.imported && (
                        <div className={classes.actions}>
                            <Button
                                disabled={!hasUnpublishedChanges}
                                size="regular"
                                style="lighter"
                                hoverStyle="brand"
                                onClick={() => handleDiscard()}
                            >
                                {translate('inspector.actions.discard', 'Discard')}
                            </Button>
                            <Button
                                disabled={!hasUnpublishedChanges}
                                size="regular"
                                style="success"
                                hoverStyle="success"
                                onClick={() => handleApply()}
                            >
                                {translate('inspector.actions.apply', 'Apply')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
