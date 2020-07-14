import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Label, MultiSelectBox, TextArea, TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { Asset, MediaUiTheme } from '../../../interfaces';
import { PropertyList, PropertyListItem } from '../../Presentation';
import { humanFileSize } from '../../../helper';
import { useAssetCollectionsQuery, useSetAssetTags, useTagsQuery, useUpdateAsset } from '../../../hooks';
import { selectedAssetState } from '../../../state';

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
    },
    tagSelection: {},
    collectionSelection: {}
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

const AssetInspector: React.FC = () => {
    const classes = useStyles();
    const { tags: allTags } = useTagsQuery();
    const { assetCollections } = useAssetCollectionsQuery();
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [collections, setCollections] = useState<string[]>([]);
    const { updateAsset, loading } = useUpdateAsset();
    const { setAssetTags, loading: setTagsLoading } = useSetAssetTags();

    const allCollections = assetCollections.map(collection => ({ label: collection.title }));
    const isEditable = selectedAsset?.localId;
    const isLoading = loading || setTagsLoading;
    const hasUnpublishedChanges =
        selectedAsset &&
        (label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice ||
            !tagsMatchAsset(tags, selectedAsset));

    const handleDiscard = useCallback(() => {
        if (selectedAsset) {
            setLabel(selectedAsset.label);
            setCaption(selectedAsset.caption);
            setCopyrightNotice(selectedAsset.copyrightNotice);
            setTags(selectedAsset.tags.map(tag => tag.label).sort() || []);
            setCollections(selectedAsset.collections.map(collection => collection.title).sort() || []);
        }
    }, [selectedAsset, setLabel, setCaption, setCopyrightNotice, setTags, setCollections]);

    const handleApply = useCallback(() => {
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

        if (!tagsMatchAsset(tags, selectedAsset)) {
            setAssetTags({
                asset: selectedAsset,
                tagNames: tags
            })
                .then(({ data }) => {
                    setSelectedAsset(data.setAssetTags);
                    Notify.ok(translate('actions.tagAsset.success', 'The asset has been tagged'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('actions.tagAsset.error', 'Error while tagging the asset'), message);
                });
        }
    }, [
        Notify,
        translate,
        caption,
        copyrightNotice,
        label,
        selectedAsset,
        setSelectedAsset,
        tags,
        setAssetTags,
        updateAsset
    ]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset]);

    // TODO: Refactor parts into separate components
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
                                    onChange={setLabel}
                                    onEnterKey={handleApply}
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
                                    onChange={setCaption}
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
                                    onChange={setCopyrightNotice}
                                />
                            </div>
                            {isEditable ? (
                                <div className={classes.propertyGroup}>
                                    <Label>{translate('inspector.tags', 'Tags')}</Label>
                                    <MultiSelectBox
                                        className={classes.tagSelection}
                                        disabled={isLoading}
                                        placeholder={translate('inspector.tags.placeholder', 'Select a tag')}
                                        values={tags}
                                        optionValueField="label"
                                        options={allTags}
                                        searchOptions={allTags}
                                        onValuesChange={setTags}
                                    />
                                </div>
                            ) : null}
                            {isEditable ? (
                                <div className={classes.propertyGroup}>
                                    <Label>{translate('inspector.assetCollections', 'Collections')}</Label>
                                    <MultiSelectBox
                                        className={classes.collectionSelection}
                                        disabled={isLoading}
                                        placeholder={translate(
                                            'inspector.collections.placeholder',
                                            'Select a collection'
                                        )}
                                        values={collections}
                                        optionValueField="label"
                                        options={allCollections}
                                        searchOptions={allCollections}
                                        onValuesChange={setCollections}
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
                                onClick={handleDiscard}
                            >
                                {translate('inspector.actions.discard', 'Discard')}
                            </Button>
                            <Button
                                disabled={!hasUnpublishedChanges || isLoading}
                                size="regular"
                                style="success"
                                hoverStyle="success"
                                onClick={handleApply}
                            >
                                {translate('inspector.actions.apply', 'Apply')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default React.memo(AssetInspector);
