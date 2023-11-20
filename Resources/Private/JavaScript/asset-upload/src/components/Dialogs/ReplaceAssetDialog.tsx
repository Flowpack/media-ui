import React, { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Button, CheckBox, Label } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useAssetsQuery, useSelectedAsset } from '@media-ui/core/src/hooks';
import { Dialog } from '@media-ui/core/src/components';
import { featureFlagsState } from '@media-ui/core/src/state';

import UploadSection from '../UploadSection';
import PreviewSection from '../PreviewSection';
import { useUploadDialogState } from '../../hooks';
import useReplaceAsset, { AssetReplacementOptions } from '../../hooks/useReplaceAsset';
import { useSetRecoilState } from 'recoil';

import classes from './ReplaceAssetDialog.module.css';
import {
    selectedAssetLabelState,
    selectedAssetCaptionState,
    selectedAssetCopyrightNoticeState,
} from '@media-ui/media-module/src/state';

const ReplaceAssetDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAsset = useSelectedAsset();
    const { replaceAsset, uploadState, loading } = useReplaceAsset();
    const { refetch } = useAssetsQuery();
    const {
        approvalAttainmentStrategy: { obtainApprovalToReplaceAsset },
    } = useMediaUi();
    const { state: dialogState, closeDialog, setFiles, setUploadPossible } = useUploadDialogState();
    const featureFlags = useRecoilValue(featureFlagsState);
    const [replacementOptions, setReplacementOptions] = React.useState<AssetReplacementOptions>({
        keepOriginalFilename: false,
        generateRedirects: false,
    });
    const setLabel = useSetRecoilState(selectedAssetLabelState);
    const setCaption = useSetRecoilState(selectedAssetCaptionState);
    const setCopyrightNotice = useSetRecoilState(selectedAssetCopyrightNoticeState);
    const acceptedFileTypes = useMemo(() => {
        // TODO: Extract this into a helper function
        const completeMediaType = selectedAsset?.file.mediaType;
        const regex = /^(?<type>(?:[.!#%&'`^~$*+\-|\w]+))\//;
        const mainType = completeMediaType.match(regex)?.groups?.type;
        return mainType ? (`${mainType}/*` as MediaType) : '';
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
                const result = await replaceAsset({ asset: selectedAsset, file, options: replacementOptions });

                Notify.ok(translate('uploadDialog.replacementFinished', 'Replacement finished'));
                closeDialog();
                void refetch();
                if (result?.data.replaceAsset.success) {
                    setLabel(file.title);
                    setCaption(file.caption);
                    setCopyrightNotice(file.copyrightNotice);
                }
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
        setLabel,
        setCaption,
        setCopyrightNotice,
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
                    disabled={!dialogState.uploadPossible}
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
                    dialogState={dialogState}
                    setFiles={setFiles}
                    setUploadPossible={setUploadPossible}
                />
            </section>
        </Dialog>
    );
};

export default React.memo(ReplaceAssetDialog);
