import React from 'react';
import { SetStateAction, Dispatch, useState } from 'react';
import cx from 'classnames';
import { SetterOrUpdater } from 'recoil';

import { Icon, TextArea, TextInput, CheckBox } from '@neos-project/react-ui-components';

import classes from './FilePreview.module.css';
import { UploadDialogStateWithFiles } from '../state/uploadDialogState';
import Property from '@media-ui/core/src/components/Property';
import { useIntl } from '@media-ui/core/src';
import { useConfigQuery } from '@media-ui/core/src/hooks';

interface UploadPropertiesConfig {
    [key: string]: {
        show: boolean;
        required: boolean;
    };
}

interface FilePreviewProps {
    file: UploadedFile;
    loading?: boolean;
    fileState: FileUploadResult;
    dialogState: UploadDialogStateWithFiles;
    setFiles: Dispatch<SetStateAction<FilesUploadState>>;
    setUploadPossible: SetterOrUpdater<boolean>;
}

type UploadProperty = string | boolean;

const FilePreview: React.FC<FilePreviewProps> = ({
    file,
    loading = false,
    fileState,
    dialogState,
    setFiles,
    setUploadPossible,
}: FilePreviewProps) => {
    const success = fileState?.success || dialogState.files.finished.includes(file);
    const disabled = success || fileState?.result === 'EXISTS' || dialogState.files.rejected.includes(file);
    const error = (fileState && !success) || dialogState.files.rejected.includes(file);
    const result =
        fileState?.result ||
        dialogState.files.rejected[dialogState.files.rejected.indexOf(file)]?.uploadStateResult ||
        dialogState.files.finished[dialogState.files.finished.indexOf(file)]?.uploadStateResult;
    const { translate } = useIntl();
    const { config } = useConfigQuery();
    const [copyrightNoticeNotNeededChecked, setCopyrightNoticeNotNeededChecked] = useState(false);
    const uploadPropertiesConfig: UploadPropertiesConfig = {};

    config.uploadProperties.forEach((config) => {
        uploadPropertiesConfig[config.name] = {
            show: config.show,
            required: config.required,
        };
    });

    const setUploadProperty = (propertyName: string, propertyValue: UploadProperty) => {
        const files: UploadedFile[] = [...dialogState.files.selected];
        const newFile =
            files.length === 0 &&
            !(dialogState.files.finished.includes(file) || dialogState.files.rejected.includes(file));
        if (newFile) {
            file[propertyName] = propertyValue;
            files.push(file);
        } else {
            files.forEach((selectedFile) => {
                if (selectedFile.name === file.name) {
                    file[propertyName] = propertyValue;
                }
            });
        }

        return files;
    };

    const getUploadPossibleValue = (files: UploadedFile[]) => {
        return (
            !loading &&
            files.length > 0 &&
            files.reduce((current, file) => {
                return (
                    current &&
                    (!uploadPropertiesConfig['copyrightNotice'].required ||
                        (!!file?.copyrightNotice && file?.copyrightNotice !== '') ||
                        !!file?.copyrightNoticeNotNeeded) &&
                    (!uploadPropertiesConfig['title'].required || (!!file?.title && file?.title !== '')) &&
                    (!uploadPropertiesConfig['caption'].required || (!!file?.caption && file?.caption !== ''))
                );
            }, true)
        );
    };

    const setCopyrightNotice = (copyrightNotice: string) => {
        const files = setUploadProperty('copyrightNotice', copyrightNotice);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };

    const setTitle = (title: string) => {
        const files = setUploadProperty('title', title);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };

    const setCaption = (caption: string) => {
        const files = setUploadProperty('caption', caption);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };

    const setCopyrightNoticeNotNeeded = (isChecked: boolean) => {
        setCopyrightNoticeNotNeededChecked(isChecked);
        const files = setUploadProperty('copyrightNoticeNotNeeded', isChecked);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };

    const isWideThumb =
        uploadPropertiesConfig['title'].show ||
        uploadPropertiesConfig['caption'].show ||
        (uploadPropertiesConfig['copyrightNotice'] && uploadPropertiesConfig['copyrightNotice'].show);
    // TODO: Output helpful localised messages for results 'EXISTS', 'ADDED', 'ERROR'
    return (
        <div className={classes.preview}>
            <div
                className={cx(
                    classes.thumb,
                    isWideThumb ? classes.thumbWide : '',
                    error ? classes.error : success ? classes.success : loading && classes.loading
                )}
                title={file.name}
            >
                <div className={classes.thumbInner}>
                    <img src={file.preview} alt={file.name} className={classes.img} />
                    {loading && <Icon icon="spinner" spin={true} />}
                    {success && <Icon icon="check" />}
                    {error && <Icon icon="exclamation-circle" />}
                    {result && <span>{result}</span>}
                </div>
            </div>
            <div className={classes.properties}>
                {uploadPropertiesConfig['title'].show ? (
                    <Property label={translate('inspector.title', 'Title')}>
                        <TextInput
                            className={classes.textInput}
                            disabled={disabled}
                            value={file.title || ''}
                            onChange={setTitle}
                        />
                    </Property>
                ) : (
                    ''
                )}
                {uploadPropertiesConfig['caption'].show ? (
                    <Property label={translate('inspector.caption', 'Caption')}>
                        <TextArea
                            className={classes.textArea}
                            disabled={disabled}
                            minRows={2}
                            expandedRows={4}
                            value={file.caption || ''}
                            onChange={setCaption}
                        />
                    </Property>
                ) : (
                    ''
                )}
                {uploadPropertiesConfig['copyrightNotice'] && uploadPropertiesConfig['copyrightNotice'].show ? (
                    <>
                        <Property label={translate('inspector.copyrightNotice', 'Copyright notice')}>
                            <TextArea
                                className={classes.textArea}
                                disabled={disabled}
                                minRows={2}
                                expandedRows={4}
                                value={file.copyrightNotice || ''}
                                onChange={setCopyrightNotice}
                            />
                        </Property>
                        {uploadPropertiesConfig['copyrightNotice'].required ? (
                            <Property
                                label={translate(
                                    'uploadDialog.copyrightNoticeNotNeeded',
                                    'Copyright notice not needed'
                                )}
                                isCheckbox={true}
                            >
                                <CheckBox
                                    onChange={setCopyrightNoticeNotNeeded}
                                    disabled={disabled}
                                    isChecked={copyrightNoticeNotNeededChecked}
                                    className={classes.checkBox}
                                />
                            </Property>
                        ) : (
                            ''
                        )}
                    </>
                ) : (
                    ''
                )}
            </div>
        </div>
    );
};

export default React.memo(FilePreview);
