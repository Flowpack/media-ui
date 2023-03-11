import React, { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core/src';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

import useClipboard from '../hooks/useClipboard';
import clipboardVisibleState from '../state/clipboardVisibleState';

// FIXME: Reading the class name from the CSS module only works in the media-module package right now for some reason, probably a Parcel v1 bug
import './ClipboardActions.module.css';

const ClipboardActions: React.FC = () => {
    const { translate } = useIntl();
    const clipboardVisible = useRecoilValue(clipboardVisibleState);
    const { clipboard, flushClipboard } = useClipboard();
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    const onDeleteClipboard = useCallback(() => {
        if (!confirm(translate('clipboard.deleteAssets.confirm', 'Delete all assets in the clipboard?'))) return;

        Promise.all(Object.values(clipboard).map(async (assetIdentity) => await deleteAsset(assetIdentity)))
            .then(() => {
                Notify.ok(translate('clipboard.deleteAssets.success', 'The assets have been deleted'));
            })
            .catch(({ message }) => {
                Notify.error(
                    translate('clipboard.deleteAssets.error', 'Error while trying to delete the assets'),
                    message
                );
            });
    }, [translate, clipboard, deleteAsset, Notify]);

    const onFlushClipboard = useCallback(() => {
        if (!confirm(translate('clipboard.flush.confirm', 'Remove all assets from clipboard?'))) return;
        flushClipboard();
    }, [flushClipboard, translate]);

    if (!clipboardVisible) return null;

    return (
        <div className="clipboardActions">
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
