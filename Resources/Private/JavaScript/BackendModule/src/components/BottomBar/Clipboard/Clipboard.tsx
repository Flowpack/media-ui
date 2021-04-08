import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../../core';
import { useClipboard } from '../../../hooks';
import { AssetIdentity } from '../../../interfaces';
import ClipboardItem from './ClipboardItem';
import { clipboardState, initialLoadCompleteState } from '../../../state';

const useStyles = createUseMediaUiStyles({
    clipboard: {
        height: '100%',
        alignSelf: 'flex-end',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        margin: '0 -.3rem',
        '& > *': {
            margin: '0 .3rem',
        },
    },
});

const Clipboard: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { clipboard } = useClipboard();
    const setClipboardState = useSetRecoilState(clipboardState);
    const initialLoadComplete = useRecoilValue(initialLoadCompleteState);

    const toggleClipboard = useCallback(
        () =>
            setClipboardState((prev) => {
                return { ...prev, visible: !prev.visible };
            }),
        [setClipboardState]
    );

    if (!initialLoadComplete) return null;

    return (
        <div className={classes.clipboard}>
            <Button disabled={!clipboard} size="regular" style="lighter" hoverStyle="brand" onClick={toggleClipboard}>
                {translate('clipboard.toggle', 'Clipboard')} ({clipboard.length})
            </Button>
            {clipboard.slice(0, 3).map((assetIdentity: AssetIdentity) => (
                <ClipboardItem key={assetIdentity.assetId} assetIdentity={assetIdentity} />
            ))}
        </div>
    );
};

export default React.memo(Clipboard);
