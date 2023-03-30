import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { initialLoadCompleteState } from '@media-ui/core/src/state';

import ClipboardItem from './ClipboardItem';
import { clipboardState } from '../state/clipboardState';
import { clipboardVisibleState } from '../state/clipboardVisibleState';

import classes from './ClipboardToggle.module.css';

const ClipboardToggle: React.FC = () => {
    const { translate } = useIntl();
    const clipboard = useRecoilValue(clipboardState);
    const [clipboardVisible, setClipboardVisible] = useRecoilState(clipboardVisibleState);
    const initialLoadComplete = useRecoilValue(initialLoadCompleteState);

    const toggleClipboard = useCallback(() => setClipboardVisible((prev) => !prev), [setClipboardVisible]);

    const size = Object.keys(clipboard).length;

    if (!initialLoadComplete) return null;

    return (
        <div className={classes.clipboardToggle}>
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
