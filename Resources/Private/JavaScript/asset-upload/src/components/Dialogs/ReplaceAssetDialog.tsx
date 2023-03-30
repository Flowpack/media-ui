import React, { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Button, CheckBox, Label } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme, useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useAssetsQuery, useSelectedAsset } from '@media-ui/core/src/hooks';
import { Dialog } from '@media-ui/core/src/components';

import UploadSection from '../UploadSection';
import PreviewSection from '../PreviewSection';
import { useUploadDialogState } from '../../hooks';
import useReplaceAsset, { AssetReplacementOptions } from '../../hooks/useReplaceAsset';
import { UploadedFile } from '../../interfaces';
import { featureFlagsState } from '@media-ui/core/src/state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    uploadArea: {
        padding: theme.spacing.full,
    },
    optionSection: {
        marginTop: theme.spacing.full,
        marginBottom: theme.spacing.full,
    },
    option: {
        marginTop: theme.spacing.half,
        marginBottom: theme.spacing.half,
    },
    label: {
        display: 'flex',
    },
}));

const ReplaceAssetDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAsset = useSelectedAsset();
    const { replaceAsset, uploadState, loading } = useReplaceAsset();
    const { refetch } = useAssetsQuery();
    const {
        approvalAttainmentStrategy: { obtainApprovalToReplaceAsset },
    } = useMediaUi();
    const featureFlags = useRecoilValue(featureFlagsState);
    const { state: dialogState, closeDialog, setFiles } = useUploadDialogState();
    const [replacementOptions, setReplacementOptions] = React.useState<AssetReplacementOptions>({
        keepOriginalFilename: false,
        generateRedirects: false,
    });
    const uploadPossible = !loading && dialogState.files.selected.length > 0;
    const classes = useStyles();
    const acceptedFileTypes = useMemo(() => {
        // TODO: Extract this into a helper function
        const completeMediaType = selectedAsset?.file.mediaType;
        const regex = /^(?<type>(?:[.!#%&'`^~$*+\-|\w]+))\//;
        const mainType = completeMediaType.match(regex)?.groups?.type;
        return mainType ? mainType + '/*' : '';
    }, [selectedAsset]);

    const handleUpload = useCallback(async () => {
        if (dialogState.files.selected.length === 0) {
            return;
        }
        const file = dialogState.files.selected[0];
        const hasApprovalToReplaceAsset = await obtainApprovalToReplaceAsset({
            asset: selectedAsset,
        });

        if (hasApprovalToReplaceAsset) {
            try {
                await replaceAsset({ asset: selectedAsset, file, options: replacementOptions });

                Notify.ok(translate('uploadDialog.replacementFinished', 'Replacement finished'));
                closeDialog();
                void refetch();
            } catch (error) {
                Notify.error(translate('assetReplacement.error', 'Replacement failed'), error);
            }
        }
    }, [
        replaceAsset,
        Notify,
        translate,
        dialogState,
        replacementOptions,
        refetch,
        selectedAsset,
        closeDialog,
        obtainApprovalToReplaceAsset,
    ]);

    const handleSetFiles = useCallback(
        (files: UploadedFile[]) => {
            setFiles((prev) => {
                return { ...prev, selected: files };
            });
        },
        [setFiles]
    );

    return (
        <Dialog
            isOpen={dialogState.visible}
            title={translate('uploadDialog.replaceAsset', 'Replace Asset')}
            onRequestClose={closeDialog}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={closeDialog}>
                    {uploadState
                        ? translate('uploadDialog.close', 'Close')
                        : translate('uploadDialog.cancel', 'Cancel')}
                </Button>,
                <Button
                    key="upload"
                    style="success"
                    hoverStyle="success"
                    disabled={!uploadPossible}
                    onClick={handleUpload}
                >
                    {translate('uploadDialog.replace', 'Replace')}
                </Button>,
            ]}
            style="wide"
        >
            <section className={classes.uploadArea}>
                <UploadSection
                    files={dialogState.files.selected}
                    loading={loading}
                    onSetFiles={handleSetFiles}
                    maxFiles={1}
                    acceptedFileTypes={acceptedFileTypes}
                />
                <section className={classes.optionSection}>
                    {featureFlags.createAssetRedirectsOption && (
                        <div className={classes.option}>
                            <Label className={classes.label}>
                                <CheckBox
                                    isChecked={replacementOptions.generateRedirects}
                                    onChange={(generateRedirects) =>
                                        setReplacementOptions({ ...replacementOptions, generateRedirects })
                                    }
                                />
                                <span>{translate('uploadDialog.generateRedirects', 'Generate redirects')}</span>
                            </Label>
                        </div>
                    )}
                    <div className={classes.option}>
                        <Label className={classes.label}>
                            <CheckBox
                                isChecked={replacementOptions.keepOriginalFilename}
                                onChange={(keepOriginalFilename) =>
                                    setReplacementOptions({ ...replacementOptions, keepOriginalFilename })
                                }
                            />
                            <span>{translate('uploadDialog.keepOriginalFilename', 'Keep original filename')}</span>
                        </Label>
                    </div>
                </section>
                <PreviewSection
                    files={dialogState.files}
                    loading={loading}
                    uploadState={uploadState ? [uploadState] : []}
                />
            </section>
        </Dialog>
    );
};

export default React.memo(ReplaceAssetDialog);
