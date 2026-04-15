import React, { useEffect, useRef, HTMLAttributes } from 'react';
import { useIntl } from '@media-ui/core';

import classes from './ErrorOverlay.module.css';
import { Icon } from '@neos-project/react-ui-components';

interface HTMLElementWithPopover extends HTMLDivElement {
    showPopover(): void;
    hidePopover(): void;
    togglePopover(): void;
}

interface ErrorOverlayProps {
    asset: Asset;
    onDeleteAsset: (asset: Asset) => void;
    size?: string;
    style?: React.CSSProperties;
}

const ErrorOverlay: React.FC = () => {
    const { translate } = useIntl();
    const popoverRef = useRef<HTMLElementWithPopover>(null);

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

    return (
        // eslint-disable-next-line react/no-unknown-property
        <div ref={popoverRef as any} popover="auto" id="error-overlay-popover">
            <button type="button" className={`neos-button ${classes.closeButton}`} onClick={handleClose}>
                <Icon icon="times" />
            </button>
            <header className={classes.neosHeader}>
                <div>Login required</div>
            </header>
            <section className={classes.textSection}>
                <p>Please login to use this asset source</p>
            </section>
            <footer className={classes.neosFooter}>
                <button type="button" className={`neos-button neos-button--danger ${classes.loginButton}`}>
                    Open login
                </button>
            </footer>
        </div>
    );
};

export default ErrorOverlay;
