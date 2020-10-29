import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Button, Label, TextArea, TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { useSelectedAsset, useUpdateAsset } from '../../../hooks';
import { CollectionSelectBox, MetadataView, TagSelectBoxAsset } from './index';

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

const AssetInspector = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const Notify = useNotify();
    const { translate } = useIntl();
    const [label, setLabel] = useState<string>(null);
    const [caption, setCaption] = useState<string>(null);
    const [copyrightNotice, setCopyrightNotice] = useState<string>(null);

    const { updateAsset, loading } = useUpdateAsset();

    const isEditable = selectedAsset?.localId && !loading;
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
                .then(() => {
                    Notify.ok(translate('actions.updateAsset.success', 'The asset has been updated'));
                })
                .catch(({ message }) => {
                    Notify.error(translate('actions.deleteAsset.error', 'Error while updating the asset'), message);
                });
        }
    }, [Notify, translate, caption, copyrightNotice, label, selectedAsset, updateAsset]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset?.id]);

    if (!selectedAsset) return null;

    // TODO: Refactor parts into separate components
    return (
        <div className={classes.inspector}>
            <>
                <div className={classes.propertyGroup}>
                    <Label>{translate('inspector.title', 'Title')}</Label>
                    <TextInput
                        disabled={!isEditable}
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
                        disabled={!isEditable}
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
                        disabled={!isEditable}
                        minRows={2}
                        expandedRows={4}
                        value={copyrightNotice || ''}
                        onChange={setCopyrightNotice}
                    />
                </div>

                {isEditable && (
                    <div className={classes.actions}>
                        <Button
                            disabled={!hasUnpublishedChanges}
                            size="regular"
                            style="lighter"
                            hoverStyle="brand"
                            onClick={handleDiscard}
                        >
                            {translate('inspector.actions.discard', 'Discard')}
                        </Button>
                        <Button
                            disabled={!hasUnpublishedChanges}
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
                {selectedAsset.assetSource.supportsTagging && <TagSelectBoxAsset />}

                <MetadataView />
            </>
        </div>
    );
};

export default React.memo(AssetInspector);
