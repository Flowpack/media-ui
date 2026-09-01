import React, { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { endpointsState, selectedAssetIdsState } from '@media-ui/core/src/state';

import classes from './EditMetadataScreen.module.css';
import { metadataEditorVisibleState } from '../index';
import { Icon } from '@neos-project/react-ui-components';
import { useNotify } from '@media-ui/core';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

const EditMetadataScreen: React.FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const endpoints = useRecoilValue(endpointsState);
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectedAssetIds = useRecoilValue(selectedAssetIdsState(selectedAssetSourceId));
    const setEditMetadataScreenVisible = useSetRecoilState(metadataEditorVisibleState);
    const [isLoading, setIsLoading] = useState(true);
    const Notify = useNotify();

    // Open the dialog when the component is mounted
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        dialog.showModal();

        // Listen for the dialog close event (triggered by ESC key or clicking outside)
        const handleClose = () => {
            setEditMetadataScreenVisible(false);
        };

        dialog.addEventListener('close', handleClose);
        return () => {
            dialog.removeEventListener('close', handleClose);
        };
    }, [setEditMetadataScreenVisible]);

    // Listen for messages from the iframe to close the dialog
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Verify the message is coming from our iframe
            if (event.source === iframeRef.current?.contentWindow) {
                if (event.data?.type === 'closeDialog') {
                    dialogRef.current?.close();
                    setEditMetadataScreenVisible(false);
                    if (event.data.showSuccessMessage) {
                        Notify.ok('The metadata has been successfully updated.');

                        // TODO: Reload asset data on success
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [Notify, setEditMetadataScreenVisible]);

    // Adjust height of dialog to content of iframe
    React.useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => {
            const iframeDocument = iframe.contentWindow?.document;
            if (!iframeDocument) return;

            // Hide the loading spinner once iframe has loaded
            setIsLoading(false);

            // Set initial height
            const initialHeight = iframeDocument.body.scrollHeight;
            iframe.style.height = `${initialHeight}px`;

            const resizeObserver = new ResizeObserver(() => {
                const height = iframeDocument.body.scrollHeight;
                iframe.style.height = `${height}px`;
            });

            resizeObserver.observe(iframeDocument.body);

            return () => resizeObserver.disconnect();
        };

        iframe.addEventListener('load', handleLoad);
        return () => iframe.removeEventListener('load', handleLoad);
    }, []);

    if (selectedAssetIds.length === 0) {
        return null;
    }

    const endpointUriWithParameters = new URL(endpoints.editMetadata, window.location.origin);
    endpointUriWithParameters.searchParams.set(
        'assetIds',
        JSON.stringify(selectedAssetIds.map((assetIdentity) => assetIdentity.assetId))
    );
    endpointUriWithParameters.searchParams.set('assetSourceId', selectedAssetSourceId);

    return (
        <dialog className={classes.editMetadataScreen} ref={dialogRef}>
            {isLoading && (
                <div className={classes.loadingContainer}>
                    <Icon icon="spinner" spin={true} size="2x" />
                </div>
            )}
            <iframe
                src={endpointUriWithParameters.toString()}
                ref={iframeRef}
                style={{ display: isLoading ? 'none' : 'block' }}
            />
        </dialog>
    );
};

export default React.memo(EditMetadataScreen);
