import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useIntl, createUseMediaUiStyles } from '@media-ui/core/src';
import { initialLoadCompleteState } from '@media-ui/core/src/state';

import ClipboardItem from './ClipboardItem';
import useClipboard from '../hooks/useClipboard';
import clipboardVisibleState from '../state/clipboardVisibleState';

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

const ClipboardToggle: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { clipboard } = useClipboard();
    const [clipboardVisible, setClipboardVisible] = useRecoilState(clipboardVisibleState);
    const initialLoadComplete = useRecoilValue(initialLoadCompleteState);

    const toggleClipboard = useCallback(() => setClipboardVisible((prev) => !prev), [setClipboardVisible]);

    const size = Object.keys(clipboard).length;

    if (!initialLoadComplete) return null;

    return (
        <div className={classes.clipboard}>
            <Button
                disabled={size === 0}
                size="regular"
                style={clipboardVisible ? 'brand' : 'lighter'}
                hoverStyle="brand"
                onClick={toggleClipboard}
            >
                {translate('clipboard.toggle', 'Clipboard')} ({size})
            </Button>
            {Object.values(clipboard)
                .slice()
                .reverse()
                .slice(0, 3)
                .map((assetIdentity: AssetIdentity) => (
                    <ClipboardItem key={assetIdentity.assetId} assetIdentity={assetIdentity} />
                ))}
        </div>
    );
};

export default React.memo(ClipboardToggle);
