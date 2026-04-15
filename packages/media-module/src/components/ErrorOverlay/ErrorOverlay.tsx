import React, { useEffect, useRef } from 'react';
import { useIntl } from '@media-ui/core';

import classes from './ErrorOverlay.module.css';
import { Icon } from '@neos-project/react-ui-components';
import { useRecoilValue } from 'recoil';
import { errorRedirectUrlState, errorTitleState, errorMessageState } from '@media-ui/core/src/state';

const ErrorOverlay: React.FC = () => {
    const { translate } = useIntl();
    const popoverRef = useRef<HTMLDivElement>(null);
    const errorRedirectUrlValue = useRecoilValue(errorRedirectUrlState);
    useEffect(() => {
        if (popoverRef.current) {
            popoverRef.current.showPopover();
        }
    }, []);

    const handleClose = () => {
        if (popoverRef.current) {
            popoverRef.current.hidePopover();
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    // TODO: Add retry & re-login button in Notification
    return (
        // eslint-disable-next-line react/no-unknown-property
        <div ref={popoverRef} popover="auto" id="error-overlay-popover">
            <button type="button" className={`neos-button ${classes.closeButton}`} onClick={handleClose}>
                <Icon icon="times" />
            </button>
            <header className={classes.neosHeader}>{translate('errorOverlay.header', 'Login required')}</header>
            <section className={classes.textSection}>
                <p>{translate('errorOverlay.text', 'This media source requires you to be logged in.')}</p>
            </section>
            <footer className={classes.neosFooter}>
                <button type="button" className={`neos-button ${classes.cancelButton}`} onClick={handleClose}>
                    {translate('errorOverlay.cancelButton', 'Cancel')}
                </button>
                <button type="button" className={`neos-button ${classes.reloadButton}`} onClick={handleReload}>
                    {translate('errorOverlay.reloadButton', 'Reload')}
                </button>
                {errorRedirectUrlValue && (
                    <a
                        href={errorRedirectUrlValue}
                        target="_blank"
                        rel="nofollow, noreferrer"
                        className={`neos-button  ${classes.loginButton}`}
                    >
                        {translate('errorOverlay.loginButton', 'Open login')}
                    </a>
                )}
            </footer>
        </div>
    );
};

export default ErrorOverlay;
