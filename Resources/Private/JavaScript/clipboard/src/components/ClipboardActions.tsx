import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useNotify } from '@media-ui/core/src';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

import useClipboard from '../hooks/useClipboard';
import clipboardState from '../state/clipboardState';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    clipboardActions: {
        display: 'flex',
        alignItems: 'baseline',
        backgroundColor: theme.colors.captionBackground,
    },
}));

const ClipboardActions: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { visible: showClipboard } = useRecoilValue(clipboardState);
    const { clipboard, addOrRemoveFromClipboard } = useClipboard();
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    const onDeleteClipboard = useCallback(() => {
        if (confirm(translate('action.deleteAssets.confirm', 'Delete all assets in the clipboard?'))) {
            Promise.all(
                clipboard.map(
                    async (assetIdentity) =>
                        await deleteAsset(assetIdentity).then(() => {
                            addOrRemoveFromClipboard(assetIdentity);
                        })
                )
            )
                .then(() => {
                    Notify.ok(translate('action.deleteAssets.success', 'The assets have been deleted'));
                })
                .catch(({ message }) => {
                    Notify.error(
                        translate('action.deleteAssets.error', 'Error while trying to delete the assets'),
                        message
                    );
                });
        }
    }, [clipboard, deleteAsset, Notify, translate]);

    if (!showClipboard) return null;

    return (
        <div className={classes.clipboardActions}>
            <IconButton
                title={translate('itemActions.delete', 'Delete asset')}
                icon="trash"
                size="regular"
                style="transparent"
                hoverStyle="warn"
                onClick={onDeleteClipboard}
            />
        </div>
    );
};

export default React.memo(ClipboardActions);
