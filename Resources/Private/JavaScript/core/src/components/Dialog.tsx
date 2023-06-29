import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';

import { Dialog as NeosUiDialog } from '@neos-project/react-ui-components';

import theme from '../Theme.module.css';

// This is a copy of the original dialog props but without the optional theme
interface DialogProps {
    type?: 'success' | 'warn' | 'error';
    style?: 'wide' | 'jumbo' | 'narrow';
    isOpen: boolean;
    title: ReactNode;
    children: ReactNode;
    onRequestClose: () => void;
    actions: ReadonlyArray<ReactNode>;
}

//
// @TODO: Remove this once https://github.com/neos/neos-ui/issues/2925 is solved.
//
export const Dialog: React.FC<DialogProps> = (props) => {
    const dialogRef = React.useRef<React.ReactInstance>();

    React.useEffect(() => {
        if (dialogRef.current) {
            const section = ReactDOM.findDOMNode(dialogRef.current) as null | HTMLElement; // eslint-disable-line react/no-find-dom-node
            section?.firstElementChild?.setAttribute('data-ignore_click_outside', 'true');
        }
    }, [dialogRef]);

    return <NeosUiDialog {...props} autoFocus={true} ref={dialogRef} className={theme.mediaModuleTheme} />;
};
