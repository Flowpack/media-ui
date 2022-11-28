import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { Button, CheckBox, Label } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme, useIntl, useMediaUi, useNotify } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { Dialog } from '@media-ui/core/src/components';

import UploadSection from '../UploadSection';
import PreviewSection from '../PreviewSection';
import { useUploadDialogState } from '../../hooks';
import useReplaceAsset, { AssetReplacementOptions } from '../../hooks/useReplaceAsset';
import { UploadedFile } from '../../interfaces';

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
}));

const ReplaceAssetDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAsset = useSelectedAsset();
    const { replaceAsset, uploadState, loading } = useReplaceAsset();
    const { refetchAssets, featureFlags } = useMediaUi();
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

    const handleUpload = useCallback(() => {
        if (dialogState.files.selected.length === 0) {
            return;
        }
        const file = dialogState.files.selected[0];
        replaceAsset({ asset: selectedAsset, file, options: replacementOptions })
            .then(() => {
                Notify.ok(translate('uploadDialog.replacementFinished', 'Replacement finished'));
                closeDialog();
                refetchAssets();
            })
            .catch((error) => {
                Notify.error(translate('assetReplacement.error', 'Replacement failed'), error);
            });
    }, [replaceAsset, Notify, translate, dialogState, replacementOptions, refetchAssets, selectedAsset, closeDialog]);

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
                            <Label>
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
                        <Label>
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
