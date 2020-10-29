import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Button, Label, TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { useUpdateAssetCollection } from '../../../hooks';
import useSelectedAssetCollection from '../../../hooks/useSelectedAssetCollection';
import { TagSelectBoxAssetCollection } from '.';
import { useRecoilValue } from 'recoil';
import selectedInspectorViewState from '../../../state/selectedInspectorViewState';

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

const AssetCollectionInspector = () => {
    const classes = useStyles();
    const selectedAssetCollection = useSelectedAssetCollection();
    const selectedInspectorView = useRecoilValue(selectedInspectorViewState);
    const Notify = useNotify();
    const { translate } = useIntl();
    const [title, setTitle] = useState<string>(null);

    const { updateAssetCollection } = useUpdateAssetCollection();

    const hasUnpublishedChanges = selectedAssetCollection && title !== selectedAssetCollection.title;

    const handleDiscard = useCallback(() => {
        if (selectedAssetCollection) {
            setTitle(selectedAssetCollection.title);
        }
    }, [selectedAssetCollection, setTitle]);

    const handleApply = useCallback(() => {
        if (title !== selectedAssetCollection.title) {
            updateAssetCollection({
                assetCollection: selectedAssetCollection,
                title
            })
                .then(() => {
                    Notify.ok(
                        translate('actions.updateAssetCollection.success', 'The asset collection has been updated')
                    );
                })
                .catch(({ message }) => {
                    Notify.error(
                        translate('actions.deleteAssetCollection.error', 'Error while updating the asset collection'),
                        message
                    );
                });
        }
    }, [Notify, translate, selectedAssetCollection, updateAssetCollection, title]);

    useEffect(() => {
        handleDiscard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAssetCollection?.id]);

    if (!selectedAssetCollection || selectedInspectorView !== 'assetCollection') return null;

    return (
        <div className={classes.inspector}>
            <div className={classes.propertyGroup}>
                <Label>{translate('inspector.title', 'Title')}</Label>
                <TextInput type="text" value={title || ''} onChange={setTitle} onEnterKey={handleApply} />
            </div>

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

            <TagSelectBoxAssetCollection />
        </div>
    );
};

export default React.memo(AssetCollectionInspector);
