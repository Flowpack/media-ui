import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

import { clipboardState } from '../state/clipboardState';
import { clipboardVisibleState } from '../state/clipboardVisibleState';

import classes from './ClipboardActions.module.css';

const ClipboardActions: React.FC = () => {
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const clipboardVisible = useRecoilValue(clipboardVisibleState);
    const [clipboard, setClipboard] = useRecoilState(clipboardState);
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    // TODO: If any of the selected assets in the clipboard are in use the operation should be blocked, ideally with a message explaining why
    const onDeleteClipboard = useCallback(async () => {
        const canDeleteAssets = await approvalAttainmentStrategy.obtainApprovalToDeleteAssets({ assets: clipboard });

        if (!canDeleteAssets) return;

        Promise.all(clipboard.map(async (assetIdentity) => await deleteAsset(assetIdentity)))
            .then(() => {
                Notify.ok(translate('clipboard.deleteAssets.success', 'The assets have been deleted'));
            })
            .catch(({ message }) => {
                Notify.error(
                    translate('clipboard.deleteAssets.error', 'Error while trying to delete the assets'),
                    message
                );
            });
    }, [approvalAttainmentStrategy, clipboard, deleteAsset, Notify, translate]);

    const onFlushClipboard = useCallback(async () => {
        const canFlushClipboard = await approvalAttainmentStrategy.obtainApprovalToFlushClipboard();
        if (!canFlushClipboard) return;
        setClipboard([]);
    }, [approvalAttainmentStrategy, setClipboard]);

    if (!clipboardVisible) return null;

    return (
        <div className={classes.clipboardActions}>
            <IconButton
                title={translate('clipboard.deleteAsset', 'Delete all assets in clipboard')}
                icon="trash"
                size="regular"
                style="transparent"
                hoverStyle="error"
                disabled={clipboard.length === 0}
                onClick={onDeleteClipboard}
            />
            <IconButton
                title={translate('clipboard.flush', 'Flush clipboard')}
                icon="broom"
                size="regular"
                style="transparent"
                hoverStyle="warn"
                disabled={clipboard.length === 0}
                onClick={onFlushClipboard}
            />
        </div>
    );
};

export default React.memo(ClipboardActions);
