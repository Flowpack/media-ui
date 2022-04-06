import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Dialog as NeosUiDialog } from '@neos-project/react-ui-components';

//
// @TODO: Remove this once https://github.com/neos/neos-ui/issues/2925 is solved.
//
export const Dialog: React.FC<any> = (props) => {
    const dialogRef = React.useRef<React.ReactInstance>();

    React.useEffect(() => {
        if (dialogRef.current) {
            const section = ReactDOM.findDOMNode(dialogRef.current) as null | HTMLElement; // eslint-disable-line react/no-find-dom-node
            section?.firstElementChild?.setAttribute('data-ignore_click_outside', 'true');
        }
    }, [dialogRef]);

    return <NeosUiDialog {...props} ref={dialogRef} />;
};
