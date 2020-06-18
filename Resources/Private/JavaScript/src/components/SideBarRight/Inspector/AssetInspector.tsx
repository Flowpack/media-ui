import * as React from 'react';
import { useEffect, useState } from 'react';

import { Button, Label, MultiSelectBox, TextArea, TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useMediaUi, useNotify } from '../../../core';
import { Asset, MediaUiTheme } from '../../../interfaces';
import { PropertyList, PropertyListItem } from '.';
import { humanFileSize } from '../../../helper';
import { useTagAsset, useUntagAsset, useUpdateAsset } from '../../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    inspector: {
        display: 'grid',
        gridAutoRows: 'auto',
        gridGap: theme.spacing.full,
        '& input, & textarea': {
            width: '100%'
        }
    },
    propertyGroup: {},
    actions: {
        display: 'flex',
        position: 'sticky',
        backgroundColor: theme.colors.mainBackground,
        bottom: 0,
        '& > *': {
            flex: 1
        }
    },
    textArea: {
        // TODO: Remove when overriding rule is removed from Minimal Module Style in Neos
        '.neos textarea&': {
            padding: theme.spacing.half
        }
    }
}));

const tagsMatchAsset = (tags: string[], asset: Asset) => {
    return (
        tags.join(',') ===
        asset.tags
            .map(tag => tag.label)
            .sort()
            .join(',')
    );
};

export default function AssetInspector() {
    const classes = useStyles();
    const { selectedAsset, setSelectedAsset, tags: allTags, assetCollections } = useMediaUi();
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [collections, setCollections] = useState<string[]>([]);
    const { updateAsset, loading } = useUpdateAsset();
    const { tagAsset, loading: tagLoading } = useTagAsset();
    const { untagAsset, loading: untagLoading } = useUntagAsset();

    const allCollections = assetCollections.map(collection => ({ label: collection.title }));
    const isEditable = selectedAsset?.localId;
    const isLoading = loading || tagLoading || untagLoading;
    const hasUnpublishedChanges =
        selectedAsset &&
        (label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice ||
            !tagsMatchAsset(tags, selectedAsset));

    const handleDiscard = () => {
        setLabel(selectedAsset?.label);
        setCaption(selectedAsset?.caption);
        setCopyrightNotice(selectedAsset?.copyrightNotice);
        setTags(selectedAsset?.tags.map(tag => tag.label).sort() || []);
        setCollections(selectedAsset?.collections.map(collection => collection.title).sort() || []);
    };

    const handleApply = () => {
        if (
            label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice
        ) {
            updateAsset({
                asset: selectedAsset,
                label,
                caption,
                copyrightNotice
            })
                .then(({ data }) => {
                    setSelectedAsset(data.updateAsset);
                    Notify.ok(translate('actions.updateAsset.success', 'The asset has been updated'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('actions.deleteAsset.error', 'Error while updating the asset'), message);
                });
        }

        // TODO: Combine all modifications into one query
        if (!tagsMatchAsset(tags, selectedAsset)) {
            // Add each tag that is missing in the asset
            tags.filter(tagName => !selectedAsset.tags.find(tag => tag.label === tagName)).forEach(tagName => {
                tagAsset({
                    asset: selectedAsset,
                    tagName
                })
                    .then(({ data }) => {
                        setSelectedAsset(data.tagAsset);
                        Notify.ok(translate('actions.tagAsset.success', 'The asset has been tagged'));
                    })
                    .catch(({ message }) => {
                        Notify.error(translate('actions.tagAsset.error', 'Error while tagging the asset'), message);
                    });
            });
            // Remove each tag that is missing in the local state
            selectedAsset.tags
                .filter(tag => !tags.find(tagName => tagName === tag.label))
                .forEach(tag => {
                    untagAsset({
                        asset: selectedAsset,
                        tagName: tag.label
                    })
                        .then(({ data }) => {
                            setSelectedAsset(data.untagAsset);
                            Notify.ok(translate('actions.untagAsset.success', 'The asset has been untagged'));
                        })
                        .catch(({ message }) => {
                            Notify.error(
                                translate('actions.untagAsset.error', 'Error while untagging the asset'),
                                message
                            );
                        });
                });
        }
    };

    useEffect(() => {
        handleDiscard();
    }, [selectedAsset]);

    return (
        <>
            {selectedAsset && (
                <div className={classes.inspector}>
                    {selectedAsset && (
                        <>
                            <div className={classes.propertyGroup}>
                                <Label>{translate('inspector.title', 'Title')}</Label>
                                <TextInput
                                    disabled={!isEditable || isLoading}
                                    type="text"
                                    value={label || ''}
                                    onChange={value => setLabel(value)}
                                    onEnterKey={() => handleApply()}
                                />
                            </div>
                            <div className={classes.propertyGroup}>
                                <Label>{translate('inspector.caption', 'Caption')}</Label>
                                <TextArea
                                    className={classes.textArea}
                                    disabled={!isEditable || isLoading}
                                    minRows={3}
                                    expandedRows={6}
                                    value={caption || ''}
                                    onChange={value => setCaption(value)}
                                />
                            </div>
                            <div className={classes.propertyGroup}>
                                <Label>{translate('inspector.copyrightNotice', 'Copyright notice')}</Label>
                                <TextArea
                                    className={classes.textArea}
                                    disabled={!isEditable || isLoading}
                                    minRows={2}
                                    expandedRows={4}
                                    value={copyrightNotice || ''}
                                    onChange={value => setCopyrightNotice(value)}
                                />
                            </div>
                            {isEditable ? (
                                <div className={classes.propertyGroup}>
                                    <Label>{translate('inspector.tags', 'Tags')}</Label>
                                    <MultiSelectBox
                                        disabled={isLoading}
                                        placeholder={translate('inspector.tags.placeholder', 'Select a tag')}
                                        values={tags}
                                        optionValueField="label"
                                        options={allTags}
                                        searchOptions={allTags}
                                        onValuesChange={values => setTags(values)}
                                    />
                                </div>
                            ) : null}
                            {isEditable ? (
                                <div className={classes.propertyGroup}>
                                    <Label>{translate('inspector.assetCollections', 'Collections')}</Label>
                                    <MultiSelectBox
                                        disabled={isLoading}
                                        placeholder={translate(
                                            'inspector.collections.placeholder',
                                            'Select a collection'
                                        )}
                                        values={collections}
                                        optionValueField="label"
                                        options={allCollections}
                                        searchOptions={allCollections}
                                        onValuesChange={values => setCollections(values)}
                                    />
                                </div>
                            ) : null}
                        </>
                    )}
                    <PropertyList>
                        {selectedAsset.file.size > 0 && (
                            <PropertyListItem
                                label={translate('inspector.property.fileSize', 'Size')}
                                value={humanFileSize(selectedAsset.file.size)}
                            />
                        )}
                        <PropertyListItem
                            label={translate('inspector.property.lastModified', 'Last modified')}
                            value={new Date(selectedAsset.lastModified).toLocaleString()}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.dimensions', 'Dimensions')}
                            value={`${selectedAsset.width}px x ${selectedAsset.height}px`}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.mediaType', 'MIME type')}
                            value={selectedAsset.file.mediaType}
                        />
                        <PropertyListItem
                            label={translate('inspector.property.filename', 'Filename')}
                            value={selectedAsset.filename}
                        />
                    </PropertyList>
                    {isEditable && (
                        <div className={classes.actions}>
                            <Button
                                disabled={!hasUnpublishedChanges || isLoading}
                                size="regular"
                                style="lighter"
                                hoverStyle="brand"
                                onClick={() => handleDiscard()}
                            >
                                {translate('inspector.actions.discard', 'Discard')}
                            </Button>
                            <Button
                                disabled={!hasUnpublishedChanges || isLoading}
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
