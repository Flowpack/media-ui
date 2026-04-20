import React, { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi } from '@media-ui/core';

import { clipboardState } from '../state/clipboardState';
import { clipboardVisibleState } from '../state/clipboardVisibleState';

import classes from './ClipboardActions.module.css';

const ClipboardActions: React.FC = () => {
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const [clipboardVisible, setClipboardVisible] = useRecoilState(clipboardVisibleState);
    const [clipboard, setClipboard] = useRecoilState(clipboardState);

    const onFlushClipboard = useCallback(async () => {
        const canFlushClipboard = await approvalAttainmentStrategy.obtainApprovalToFlushClipboard();
        if (!canFlushClipboard) return;
        setClipboard([]);
    }, [approvalAttainmentStrategy, setClipboard]);

    const toggleClipboard = useCallback(() => setClipboardVisible((prev) => !prev), [setClipboardVisible]);

    if (!clipboardVisible) return null;

    return (
        <div className={classes.clipboardActions}>
            <IconButton
                title={translate('clipboard.flush', 'Flush clipboard')}
                icon="broom"
                size="regular"
                style="transparent"
                hoverStyle="warn"
                disabled={clipboard.length === 0}
                onClick={onFlushClipboard}
            />
            <IconButton
                title={translate('clipboard.close', 'Close clipboard')}
                icon="times"
                size="regular"
                style="transparent"
                onClick={toggleClipboard}
            />
        </div>
    );
};

export default React.memo(ClipboardActions);
