import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useNotify } from '@media-ui/core/src';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

import useClipboard from '../hooks/useClipboard';
import clipboardVisibleState from '../state/clipboardVisibleState';

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
    const clipboardVisible = useRecoilValue(clipboardVisibleState);
    const { clipboard, addOrRemoveFromClipboard } = useClipboard();
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    const onDeleteClipboard = useCallback(() => {
        if (!confirm(translate('clipboard.deleteAssets.confirm', 'Delete all assets in the clipboard?'))) return;

        Promise.all(
            clipboard.map(
                async (assetIdentity) =>
                    await deleteAsset(assetIdentity).then(() => {
                        addOrRemoveFromClipboard(assetIdentity);
                    })
            )
        )
            .then(() => {
                Notify.ok(translate('clipboard.deleteAssets.success', 'The assets have been deleted'));
            })
            .catch(({ message }) => {
                Notify.error(
                    translate('clipboard.deleteAssets.error', 'Error while trying to delete the assets'),
                    message
                );
            });
    }, [translate, clipboard, deleteAsset, addOrRemoveFromClipboard, Notify]);

    const onFlushClipboard = useCallback(() => {
        if (!confirm(translate('clipboard.flush.confirm', 'Remove all assets from clipboard?'))) return;

        clipboard.map((assetIdentity) => {
            addOrRemoveFromClipboard(assetIdentity);
        });
    }, [addOrRemoveFromClipboard, clipboard, translate]);

    if (!clipboardVisible) return null;

    return (
        <div className={classes.clipboardActions}>
            <IconButton
                title={translate('clipboard.deleteAsset', 'Delete all assets in clipboard')}
                icon="trash"
                size="regular"
                style="transparent"
                hoverStyle="warn"
                onClick={onDeleteClipboard}
            />
            <IconButton
                title={translate('clipboard.flush', 'Flush clipboard')}
                icon="clipboard"
                size="regular"
                style="transparent"
                hoverStyle="warn"
                onClick={onFlushClipboard}
            />
        </div>
    );
};

export default React.memo(ClipboardActions);
