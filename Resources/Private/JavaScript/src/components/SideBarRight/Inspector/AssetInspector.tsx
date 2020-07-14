import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Label, TextArea, TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { useUpdateAsset } from '../../../hooks';
import { selectedAssetState } from '../../../state';
import { CollectionSelectBox, MetadataView, TagSelectBox } from './index';

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

const AssetInspector: React.FC = () => {
    const classes = useStyles();
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);
    const { updateAsset, loading } = useUpdateAsset();

    const isEditable = selectedAsset?.localId;
    const isLoading = loading;
    const hasUnpublishedChanges =
        selectedAsset &&
        (label !== selectedAsset.label ||
            caption !== selectedAsset.caption ||
            copyrightNotice !== selectedAsset.copyrightNotice);

    const handleDiscard = useCallback(() => {
        if (selectedAsset) {
            setLabel(selectedAsset.label);
            setCaption(selectedAsset.caption);
            setCopyrightNotice(selectedAsset.copyrightNotice);
        }
    }, [selectedAsset, setLabel, setCaption, setCopyrightNotice]);

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
    }, [Notify, translate, caption, copyrightNotice, label, selectedAsset, setSelectedAsset, updateAsset]);

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

                            {selectedAsset.assetSource.supportsCollections && <CollectionSelectBox />}
                            {selectedAsset.assetSource.supportsTagging && <TagSelectBox />}

                            <MetadataView />
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default React.memo(AssetInspector);
